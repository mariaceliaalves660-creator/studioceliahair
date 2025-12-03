import { supabase } from './client';

const BUCKET_NAME = 'course_content'; // Nome do bucket para conteúdo de cursos

export async function uploadCourseFile(
  file: File, 
  courseId: string, 
  moduleId: string, 
  lessonId: string
): Promise<string> {
  const fileExtension = file.name.split('.').pop();
  const path = `${courseId}/${moduleId}/${lessonId}/${Date.now()}.${fileExtension}`;

  const { data, error } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(path, file, {
      cacheControl: '3600',
      upsert: false,
    });

  if (error) {
    console.error('Erro ao fazer upload do arquivo:', error);
    throw new Error(`Falha no upload: ${error.message}`);
  }

  // Get public URL
  const { data: publicUrlData } = supabase.storage
    .from(BUCKET_NAME)
    .getPublicUrl(path);

  if (!publicUrlData || !publicUrlData.publicUrl) {
    throw new Error('Não foi possível obter a URL pública do arquivo.');
  }

  return publicUrlData.publicUrl;
}

// SQL para criar o bucket e políticas de RLS (apenas para referência, não será executado diretamente)
/*
CREATE BUCKET course_content;

CREATE POLICY "Allow authenticated read access" ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'course_content');
CREATE POLICY "Allow authenticated uploads" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'course_content');
CREATE POLICY "Allow authenticated updates" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'course_content');
*/