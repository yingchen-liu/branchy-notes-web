let token: string | undefined;

export const updateToken = (newToken?: string) => {
  token = newToken;
};

export const getToken = () => {
  return token
};

export const createHeader = () => {
  return {
    headers: {
      ...(getToken() && { Authorization: `Bearer ${getToken()}` }),
    },
  };
};