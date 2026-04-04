import json
import io
import google.auth
from googleapiclient.discovery import build
from googleapiclient.http import MediaIoBaseUpload

class DriveMCPClient:
    """
    A simulated MCP Client for Google Drive (Stretch Goal).
    Allows the AI to export final decision reports directly to the user's workspace.
    """
    def __init__(self):
        self.scopes = ['https://www.googleapis.com/auth/drive.file']
        try:
            # Uses GOOGLE_APPLICATION_CREDENTIALS or default Compute Engine credentials
            self.credentials, self.project_id = google.auth.default(scopes=self.scopes)
            self.service = build('drive', 'v3', credentials=self.credentials)
        except Exception as e:
            print(f"Warning: Could not initialize Google Drive client. {e}")
            self.service = None

    def export_document(self, filename: str, content: str) -> str:
        """
        Creates a new Google Doc with the specified content and returns its link.
        """
        if not self.service:
            return json.dumps({
                "status": "error", 
                "message": "Drive service not initialized. Make sure Google credentials are set and Drive API is enabled."
            })
        
        try:
            file_metadata = {
                'name': filename,
                'mimeType': 'application/vnd.google-apps.document'
            }
            
            # Upload the text content as a plain text stream, and Google Drive will automatically
            # convert it into a Google Doc because of the mimeType specified above.
            media = MediaIoBaseUpload(
                io.BytesIO(content.encode('utf-8')), 
                mimetype='text/plain', 
                resumable=True
            )
            
            file = self.service.files().create(
                body=file_metadata, 
                media_body=media, 
                fields='id, webViewLink'
            ).execute()
            
            return json.dumps({
                "status": "success", 
                "file_id": file.get('id'),
                "link": file.get('webViewLink')
            })
        except Exception as e:
            return json.dumps({"status": "error", "message": str(e)})

# Initialize a global MCP client
drive_mcp = DriveMCPClient()
