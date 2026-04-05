// File Download/Delete API — GET stream from R2, DELETE remove
interface Env { DB: D1Database; UPLOADS?: R2Bucket; }

export const onRequestGet: PagesFunction<Env> = async ({ params, env }) => {
  const r2 = env.UPLOADS;
  const db = env.DB;
  if (!r2) return Response.json({ error: 'File storage not configured' }, { status: 503 });

  try {
    const fileId = params.key as string;

    // Look up file record in D1
    let r2Key: string;
    let filename: string;
    let contentType: string;

    if (db) {
      const record = await db.prepare('SELECT * FROM uploaded_files WHERE id = ?').bind(fileId).first() as Record<string, unknown> | null;
      if (!record) return Response.json({ error: 'File not found' }, { status: 404 });
      r2Key = record.r2_key as string;
      filename = record.filename as string;
      contentType = record.content_type as string || 'application/octet-stream';
    } else {
      // Fallback: try file ID as R2 key directly
      r2Key = fileId;
      filename = fileId;
      contentType = 'application/octet-stream';
    }

    const object = await r2.get(r2Key);
    if (!object) return Response.json({ error: 'File not found in storage' }, { status: 404 });

    return new Response(object.body, {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `inline; filename="${filename}"`,
        'Cache-Control': 'public, max-age=3600',
      },
    });
  } catch (err) {
    return Response.json({ error: 'Download failed' }, { status: 500 });
  }
};

export const onRequestDelete: PagesFunction<Env> = async ({ params, env }) => {
  const r2 = env.UPLOADS;
  const db = env.DB;
  if (!r2) return Response.json({ error: 'File storage not configured' }, { status: 503 });
  if (!db) return Response.json({ error: 'Database not available' }, { status: 503 });

  try {
    const fileId = params.key as string;

    const record = await db.prepare('SELECT * FROM uploaded_files WHERE id = ?').bind(fileId).first() as Record<string, unknown> | null;
    if (!record) return Response.json({ error: 'File not found' }, { status: 404 });

    // Delete from R2
    await r2.delete(record.r2_key as string);

    // Delete from D1
    await db.prepare('DELETE FROM uploaded_files WHERE id = ?').bind(fileId).run();

    return Response.json({ message: 'File deleted successfully' });
  } catch (err) {
    return Response.json({ error: 'Delete failed' }, { status: 500 });
  }
};
