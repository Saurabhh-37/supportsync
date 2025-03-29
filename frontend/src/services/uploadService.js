import API from '../api';

const uploadService = {
  uploadAttachment: async (file, ticketId = null) => {
    const formData = new FormData();
    formData.append('file', file);
    if (ticketId) {
      formData.append('ticket_id', ticketId);
    }
    
    const response = await API.post('/api/upload/attachments', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return response.data;
  },

  deleteAttachment: async (attachmentId) => {
    const response = await API.delete(`/api/upload/attachments/${attachmentId}`);
    return response.data;
  },
};

export default uploadService; 