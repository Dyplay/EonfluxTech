import { ID } from 'appwrite';
import { account } from './appwrite';

export type AuthError = {
  message: string;
  code: number;
};

export async function login(email: string, password: string) {
  try {
    const session = await account.createEmailPasswordSession(email, password);
    return { data: session, error: null };
  } catch (error: any) {
    return {
      data: null,
      error: { message: error.message, code: error.code } as AuthError,
    };
  }
}

export async function register(email: string, password: string, name: string) {
  try {
    const user = await account.create(ID.unique(), email, password, name);
    await account.createEmailPasswordSession(email, password);
    return { data: user, error: null };
  } catch (error: any) {
    return {
      data: null,
      error: { message: error.message, code: error.code } as AuthError,
    };
  }
}

export async function logout() {
  try {
    await account.deleteSession('current');
    return { error: null };
  } catch (error: any) {
    return {
      error: { message: error.message, code: error.code } as AuthError,
    };
  }
}

export async function getCurrentUser() {
  try {
    const user = await account.get();
    return { data: user, error: null };
  } catch (error: any) {
    return {
      data: null,
      error: { message: error.message, code: error.code } as AuthError,
    };
  }
}

export async function isUserAdmin() {
  try {
    const user = await account.get();
    return user?.prefs?.admin === true || user?.prefs?.admin === 'true';
  } catch (error) {
    return false;
  }
}

export async function updateProfile(name: string, avatar?: string) {
  try {
    const user = await account.updatePrefs({ name, avatar });
    return { data: user, error: null };
  } catch (error: any) {
    return {
      data: null,
      error: { message: error.message, code: error.code } as AuthError,
    };
  }
}

export async function updateEmail(email: string, password: string) {
  try {
    const user = await account.updateEmail(email, password);
    return { data: user, error: null };
  } catch (error: any) {
    return {
      data: null,
      error: { message: error.message, code: error.code } as AuthError,
    };
  }
}

export async function updatePassword(password: string, oldPassword: string) {
  try {
    const user = await account.updatePassword(password, oldPassword);
    return { data: user, error: null };
  } catch (error: any) {
    return {
      data: null,
      error: { message: error.message, code: error.code } as AuthError,
    };
  }
} 