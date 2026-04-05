// File Upload/Download API — POST upload, GET list
interface Env { DB: D1Database; UPLOADS?: R2Bucket; }

export const onRequestPost: PagesFunction<Env> = async ({ request, env, data }) => {
  const db = env.DB;
  const r2 = env.UPLOADS;
  if (!r2) return Response.json({ error: 'File storage not configured. R2 bucket binding required.' }, { status: 503 });
  if (!db) return Response.json({ error: 'Database not available' }, { status: 503 });

  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const entityType = formData.get('entity_type') as string;
    const entityId = formData.get('entity_id') as string;

    if (!file) return Response.json({ error: 'No file provided' }, { status: 400 });
    if (!entityType || !entityId) return Response.json({ error: 'entity_type and entity_id required' }, { status: 400 });

    // 10MB limit
    if (file.size > 10 * 1024 * 1024) {
      return Response.json({ error: 'File too large. Maximum size is 10MB.' }, { status: 413 });
    }

    const id = `file-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const r2Key = `${entityType}/${entityId}/${id}-${file.name}`;

    // Store in R2
    await r2.put(r2Key, file.stream(), {
      httpMetadata: { contentType: file.type },
      customMetadata: { entityType, entityId, originalName: file.name },
    });

    // Record in D1
    const currentUser = (data as Record<string, unknown>)?.currentUser as Record<string, unknown> | null;
    await db.prepare(
      `INSERT INTO uploaded_files (id, r2_key, entity_type, entity_id, filename, content_type, size_bytes, uploaded_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
    ).bind(
      id, r2Key, entityType, entityId, file.name, file.type, file.size,
      currentUser?.id || 'anonymous'
    ).run();

    return Response.json({
      file: { id, r2_key: r2Key, filename: file.name, content_type: file.type, size_bytes: file.size },
      message: 'File uploaded successfully'
    }, { status: 201 });
  } catch (err) {
    return Response.json({ error: 'Upload failed: ' + (err instanceof Error ? err.message : 'Unknown error') }, { status: 500 });
  }
};

export const onRequestGet: PagesFunction<Env> = async ({ env, request }) => {
  const db = env.DB;
  if (!db) return Response.json({ error: 'Database not available', files: [] }, { status: 503 });

  try {
    const url = new URL(request.url);
    const entityType = url.searchParams.get('entity_type');
    const entityId = url.searchParams.get('entity_id');

    let query = 'SELECT * FROM uploaded_files WHERE 1=1';
    const params: string[] = [];
    if (entityType) { query += ' AND entity_type = ?'; params.push(entityType); }
    if (entityId) { query += ' AND entity_id = ?'; params.push(entityId); }
    query += ' ORDER BY created_at DESC';

    const { results } = await db.prepare(query).bind(...params).all();
    return Response.json({ files: results });
  } catch (err) {
    return Response.json({ error: 'Failed to list files', files: [] }, { status: 500 });
  }
};
