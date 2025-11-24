import reportService from '../reportService';
import axios from 'axios';

vi.mock('axios');

describe('reportService', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.resetAllMocks();
  });

  it('posts report data with auth header when token present', async () => {
    const fakeResponse = { data: { success: true, message: 'ok' } };
    axios.post.mockResolvedValueOnce(fakeResponse);

    localStorage.setItem('token', 'abc123');

    const reportData = { reportedUserId: 'U1', reason: 'Spam', description: 'spam', chatContext: [] };

    const result = await reportService.submitReport(reportData);

    expect(axios.post).toHaveBeenCalledTimes(1);
    // URL should end with /reports (base comes from env but test just verifies first arg contains /reports)
    expect(axios.post.mock.calls[0][0]).toContain('/reports');
    // headers should include Authorization
    expect(axios.post.mock.calls[0][2].headers.Authorization).toBe('Bearer abc123');

    expect(result).toEqual(fakeResponse.data);
  });
});
