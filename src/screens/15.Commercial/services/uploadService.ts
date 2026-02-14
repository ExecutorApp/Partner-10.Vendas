// ========================================
// Servico de Upload de Midias
// Upload para S3 ou servidor local
// ========================================

// ========================================
// Configuracao
// ========================================
const UPLOAD_URL = process.env.UPLOAD_URL || 'http://localhost:3001/api/upload';
const S3_BUCKET = process.env.S3_BUCKET || '';
const AWS_REGION = process.env.AWS_REGION || 'us-east-1';

// ========================================
// Interface de Resposta de Upload
// ========================================
interface UploadResponse {
  success: boolean;                              //......Se foi sucesso
  url?: string;                                  //......URL do arquivo
  error?: string;                                //......Erro se houver
  fileName?: string;                             //......Nome do arquivo
  size?: number;                                 //......Tamanho em bytes
  mimeType?: string;                             //......Tipo MIME
}

// ========================================
// Gerar Nome Unico para Arquivo
// ========================================
const generateFileName = (extension: string): string => {
  const timestamp = Date.now();                  //......Timestamp atual
  const random = Math.random().toString(36).substring(2, 8);
  return `${timestamp}-${random}.${extension}`;
};

// ========================================
// Obter Extensao do URI
// ========================================
const getExtension = (uri: string): string => {
  const parts = uri.split('.');                  //......Divide por ponto
  return parts[parts.length - 1] || 'bin';       //......Retorna extensao
};

// ========================================
// Obter Tipo MIME
// ========================================
const getMimeType = (extension: string): string => {
  const mimeTypes: Record<string, string> = {
    // Audio
    mp3: 'audio/mpeg',                           //......MP3
    wav: 'audio/wav',                            //......WAV
    ogg: 'audio/ogg',                            //......OGG
    m4a: 'audio/mp4',                            //......M4A
    aac: 'audio/aac',                            //......AAC
    // Imagem
    jpg: 'image/jpeg',                           //......JPG
    jpeg: 'image/jpeg',                          //......JPEG
    png: 'image/png',                            //......PNG
    gif: 'image/gif',                            //......GIF
    webp: 'image/webp',                          //......WEBP
    // Video
    mp4: 'video/mp4',                            //......MP4
    mov: 'video/quicktime',                      //......MOV
    avi: 'video/x-msvideo',                      //......AVI
    webm: 'video/webm',                          //......WEBM
    // Documento
    pdf: 'application/pdf',                      //......PDF
    doc: 'application/msword',                   //......DOC
    docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    xls: 'application/vnd.ms-excel',             //......XLS
    xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    ppt: 'application/vnd.ms-powerpoint',        //......PPT
    pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    txt: 'text/plain',                           //......TXT
    zip: 'application/zip',                      //......ZIP
  };

  return mimeTypes[extension.toLowerCase()] || 'application/octet-stream';
};

// ========================================
// Servico de Upload
// ========================================
export const uploadService = {
  // ========================================
  // Upload de Audio
  // ========================================
  async uploadAudio(audioUri: string): Promise<string> {
    try {
      const extension = getExtension(audioUri);
      const fileName = generateFileName(extension);
      const mimeType = getMimeType(extension);

      const response = await this.uploadFile(
        audioUri,
        fileName,
        mimeType,
        'audios'
      );

      if (!response.success || !response.url) {
        throw new Error(response.error || 'Falha no upload do audio');
      }

      return response.url;                       //......Retorna URL
    } catch (error) {
      console.error('[UploadService] Erro ao fazer upload de audio:', error);
      throw error;                               //......Propaga erro
    }
  },

  // ========================================
  // Upload de Imagem
  // ========================================
  async uploadImage(imageUri: string): Promise<string> {
    try {
      const extension = getExtension(imageUri);
      const fileName = generateFileName(extension);
      const mimeType = getMimeType(extension);

      const response = await this.uploadFile(
        imageUri,
        fileName,
        mimeType,
        'images'
      );

      if (!response.success || !response.url) {
        throw new Error(response.error || 'Falha no upload da imagem');
      }

      return response.url;                       //......Retorna URL
    } catch (error) {
      console.error('[UploadService] Erro ao fazer upload de imagem:', error);
      throw error;                               //......Propaga erro
    }
  },

  // ========================================
  // Upload de Video
  // ========================================
  async uploadVideo(videoUri: string): Promise<string> {
    try {
      const extension = getExtension(videoUri);
      const fileName = generateFileName(extension);
      const mimeType = getMimeType(extension);

      const response = await this.uploadFile(
        videoUri,
        fileName,
        mimeType,
        'videos'
      );

      if (!response.success || !response.url) {
        throw new Error(response.error || 'Falha no upload do video');
      }

      return response.url;                       //......Retorna URL
    } catch (error) {
      console.error('[UploadService] Erro ao fazer upload de video:', error);
      throw error;                               //......Propaga erro
    }
  },

  // ========================================
  // Upload de Documento
  // ========================================
  async uploadDocument(
    documentUri: string,
    originalFileName?: string
  ): Promise<string> {
    try {
      const extension = getExtension(documentUri);
      const fileName = originalFileName || generateFileName(extension);
      const mimeType = getMimeType(extension);

      const response = await this.uploadFile(
        documentUri,
        fileName,
        mimeType,
        'documents'
      );

      if (!response.success || !response.url) {
        throw new Error(response.error || 'Falha no upload do documento');
      }

      return response.url;                       //......Retorna URL
    } catch (error) {
      console.error('[UploadService] Erro ao fazer upload de documento:', error);
      throw error;                               //......Propaga erro
    }
  },

  // ========================================
  // Upload Generico de Arquivo
  // ========================================
  async uploadFile(
    fileUri: string,
    fileName: string,
    mimeType: string,
    folder: string
  ): Promise<UploadResponse> {
    try {
      // Criar FormData
      const formData = new FormData();

      // Adicionar arquivo
      formData.append('file', {
        uri: fileUri,                            //......URI do arquivo
        name: fileName,                          //......Nome do arquivo
        type: mimeType,                          //......Tipo MIME
      } as any);

      // Adicionar pasta destino
      formData.append('folder', folder);

      // Fazer upload
      const response = await fetch(UPLOAD_URL, {
        method: 'POST',                          //......Metodo POST
        body: formData,                          //......Corpo FormData
        headers: {
          'Content-Type': 'multipart/form-data', //......Tipo multipart
        },
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,                        //......Falha
          error: data.error || 'Erro no upload',
        };
      }

      return {
        success: true,                           //......Sucesso
        url: data.url,                           //......URL do arquivo
        fileName: data.fileName,                 //......Nome do arquivo
        size: data.size,                         //......Tamanho
        mimeType: data.mimeType,                 //......Tipo MIME
      };
    } catch (error) {
      console.error('[UploadService] Erro no upload:', error);
      return {
        success: false,                          //......Falha
        error: error instanceof Error ? error.message : 'Erro desconhecido',
      };
    }
  },

  // ========================================
  // Upload para S3 (Direto do Cliente)
  // ========================================
  async uploadToS3(
    fileUri: string,
    folder: string
  ): Promise<string> {
    try {
      // 1. Obter URL pre-assinada do backend
      const presignedResponse = await fetch(
        `${UPLOAD_URL}/presigned`,
        {
          method: 'POST',                        //......Metodo POST
          headers: {
            'Content-Type': 'application/json', //......Tipo JSON
          },
          body: JSON.stringify({
            folder: folder,                      //......Pasta destino
            extension: getExtension(fileUri),    //......Extensao
          }),
        }
      );

      const presignedData = await presignedResponse.json();

      if (!presignedData.uploadUrl) {
        throw new Error('Falha ao obter URL pre-assinada');
      }

      // 2. Fazer upload direto para S3
      const fileBlob = await fetch(fileUri).then((r) => r.blob());

      const s3Response = await fetch(presignedData.uploadUrl, {
        method: 'PUT',                           //......Metodo PUT
        body: fileBlob,                          //......Blob do arquivo
        headers: {
          'Content-Type': getMimeType(getExtension(fileUri)),
        },
      });

      if (!s3Response.ok) {
        throw new Error('Falha no upload para S3');
      }

      // 3. Retornar URL publica
      return presignedData.publicUrl;            //......URL publica
    } catch (error) {
      console.error('[UploadService] Erro no upload S3:', error);
      throw error;                               //......Propaga erro
    }
  },

  // ========================================
  // Converter URI Local para Base64
  // ========================================
  async uriToBase64(uri: string): Promise<string> {
    try {
      const response = await fetch(uri);
      const blob = await response.blob();

      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64 = reader.result as string;
          resolve(base64.split(',')[1] || base64);
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      console.error('[UploadService] Erro ao converter para Base64:', error);
      throw error;                               //......Propaga erro
    }
  },

  // ========================================
  // Obter Tamanho do Arquivo
  // ========================================
  async getFileSize(uri: string): Promise<number> {
    try {
      const response = await fetch(uri);
      const blob = await response.blob();
      return blob.size;                          //......Retorna tamanho
    } catch (error) {
      console.error('[UploadService] Erro ao obter tamanho:', error);
      return 0;                                  //......Retorna 0 em erro
    }
  },
};

// ========================================
// Export Default
// ========================================
export default uploadService;
