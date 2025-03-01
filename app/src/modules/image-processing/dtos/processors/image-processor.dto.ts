export interface FileUploadReqBody {
  message: string;
  committer: {
    name: string;
    email: string;
  };
  branch: string;
  content: string;
}

export interface FileUploadResponse {
  content: {
    download_url: string;
  };
}
