import { MockAxiosLib } from './lib/axios/axios.service.mock';

jest.mock('axios', () => MockAxiosLib);
