/**
 * Register a new user
 * POST /auth/register
 */
export const register = async (fullName, email, password, confirmPassword) => {
  try {
    const response = await fetch('/auth/register', {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: fullName,
        email,
        password,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Registration failed');
    }

    return data;
  } catch (error) {
    console.error('Registration error:', error);
    throw error;
  }
};

/**
 * Login user
 * POST /auth/login
 */
export const login = async (email, password) => {
  try {
    const response = await fetch('/auth/login', {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        password,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Login failed');
    }

    return {
      token: data.token,
      user: data.user,
    };
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};

/**
 * Logout user
 * POST /auth/logout
 */
export const logout = async () => {
  try {
    const response = await fetch('/auth/logout', {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Logout failed');
    }

    return response.json();
  } catch (error) {
    console.error('Logout error:', error);
    throw error;
  }
};
