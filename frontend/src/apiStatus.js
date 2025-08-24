import axios from 'axios';

export const apiStatus = {
  reachable: true,
  async check() {
    try {
      await axios.get('/api/ping'); // You should implement /api/ping on your backend
      this.reachable = true;
    } catch (err) {
      this.reachable = false;
    }
    return this.reachable;
  }
};
