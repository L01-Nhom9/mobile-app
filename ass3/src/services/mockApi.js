// Mock data stores
const USERS = [
  { _id: '1', username: 'student', password: '123', fullName: 'Nguyen Van A', role: 'student', studentId: '201201' },
  { _id: '2', username: 'teacher', password: '123', fullName: 'Le Thi B', role: 'instructor' }
];

const CLASSROOMS = [
  { _id: '101', name: 'Mobile Development', code: 'CO3007', instructor: { fullName: 'Trần Văn Hoài' }, students: ['1'] },
  { _id: '102', name: 'Software Project', code: 'CO3008', instructor: { fullName: 'Huỳnh Tuong Nguyen' }, students: ['1'] }
];

const REQUESTS = [];

// Mock API functions simulating async responses
const mockApi = {
  auth: {
    login: async ({ username, password }) => {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          const user = USERS.find(u => u.username === username && u.password === password);
          if (user) resolve({ data: user });
          else reject({ message: 'Invalid credentials' });
        }, 500);
      });
    }
  },
  classrooms: {
    list: async (userId, role) => {
      return new Promise((resolve) => {
        setTimeout(() => {
          // Return all classes for demo purposes, or filter if strict
          // const list = role === 'student' ? CLASSROOMS.filter(c => c.students.includes(userId)) : CLASSROOMS;
          resolve({ data: CLASSROOMS });
        }, 500);
      });
    }
  },
  requests: {
    create: async (data) => {
      return new Promise((resolve) => {
        setTimeout(() => {
          const newReq = { ...data, _id: Math.random().toString(), status: 'pending', createdAt: new Date() };
          REQUESTS.push(newReq);
          resolve({ data: newReq });
        }, 500);
      });
    }
  }
};

export default mockApi;
