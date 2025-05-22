import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Save, 
  Users, 
  Share, 
  MoreVertical,
  Star,
  File as FileIcon
} from 'lucide-react';

const DocumentEditor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [document, setDocument] = useState(null);
  const [content, setContent] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [collaborators, setCollaborators] = useState([
    { id: 1, name: 'John Doe', initials: 'JD', color: 'bg-blue-600' },
    { id: 2, name: 'Alice Smith', initials: 'AS', color: 'bg-green-600' }
  ]);

  // Fetch document data when component mounts
  useEffect(() => {
    // In a real app, this would be an API call to get document data
    const fetchDocument = async () => {
      try {
        setIsLoading(true);
        setTimeout(() => {
          const mockDocument = {
            id,
            name: 'Project Documentation',
            content: '# Project Documentation\n\nThis is a sample document for the SmartNotes application.\n\n## Features\n\n- Real-time collaboration\n- Rich text editing\n- Document versioning',
            createdAt: '2025-05-10T10:00:00Z',
            updatedAt: '2025-05-20T15:30:00Z',
            createdBy: 'John Doe'
          };
          
          setDocument(mockDocument);
          setContent(mockDocument.content);
          setIsLoading(false);
        }, 500);
      } catch (error) {
        console.error('Error fetching document:', error);
        setIsLoading(false);
      }
    };

    fetchDocument();
  }, [id]);

  // Handle document save
  const handleSave = () => {
    // In a real app, this would be an API call to save the document
    console.log('Saving document:', { id, content });
    // Update the document's content in state
    setDocument({ ...document, content, updatedAt: new Date().toISOString() });
  };

  // Handle going back to workspace
  const handleBack = () => {
    navigate(-1);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Document Header */}
      <header className="bg-white border-b border-gray-200 px-4 py-2 shadow-sm sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button 
              onClick={handleBack}
              className="p-1.5 rounded-full hover:bg-gray-100"
            >
              <ArrowLeft size={20} />
            </button>
            
            <div className="flex items-center space-x-3">
              <div className="bg-blue-500 text-white p-1.5 rounded">
                <FileIcon size={18} />
              </div>
              <div>
                <h1 className="font-medium text-gray-800">{document?.name}</h1>
                <div className="text-xs text-gray-500">
                  Last updated {new Date(document?.updatedAt).toLocaleString()}
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <div className="flex -space-x-2">
              {collaborators.map(user => (
                <div 
                  key={user.id}
                  className={`${user.color} text-white h-8 w-8 rounded-full flex items-center justify-center border-2 border-white text-sm font-medium`}
                  title={user.name}
                >
                  {user.initials}
                </div>
              ))}
            </div>
            
            <button className="p-2 hover:bg-gray-100 rounded-full">
              <Star size={20} className="text-gray-400" />
            </button>
            
            <button className="p-2 hover:bg-gray-100 rounded-full">
              <Share size={20} className="text-gray-700" />
            </button>
            
            <button 
              onClick={handleSave}
              className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-md flex items-center text-sm"
            >
              <Save size={16} className="mr-1" /> Save
            </button>
            
            <button className="p-2 hover:bg-gray-100 rounded-full">
              <MoreVertical size={20} />
            </button>
          </div>
        </div>
      </header>

      {/* Document Editor */}
      <div className="flex-grow overflow-auto">
        <div className="max-w-4xl mx-auto my-8 px-4">
          <div className="bg-white shadow-sm rounded-lg border border-gray-200 min-h-[800px] p-8">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full h-full min-h-[700px] focus:outline-none resize-none font-mono"
              placeholder="Start typing your document content..."
            />
          </div>
        </div>
      </div>

      {/* Collaboration Status */}
      <div className="bg-white border-t border-gray-200 py-2 px-4 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="h-2 w-2 bg-green-500 rounded-full"></div>
          <span className="text-sm text-gray-600">Connected</span>
        </div>
        
        <div className="flex items-center">
          <Users size={16} className="text-gray-500 mr-1" />
          <span className="text-sm text-gray-600">{collaborators.length} online</span>
        </div>
      </div>
    </div>
  );
};

export default DocumentEditor;