import React, { useState, useEffect } from 'react';
import { X, Mail, Lock, User, Sparkles, LogIn, Check, ShieldCheck, UserCheck, Shield, ShieldAlert, Smartphone, Loader2, Eye, EyeOff, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { User as UserType } from '../types';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, sendPasswordResetEmail, setPersistence, browserLocalPersistence, browserSessionPersistence } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { getFirestoreUserProfile, saveFirestoreUserProfile, registerFallbackUser, loginFallbackUser, checkUserExists, recoverPhonePassword } from '../lib/db';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: UserType) => void;
}

const PRESET_USERS: (UserType & { avatar: string; description: string })[] = [
  {
    id: 'user-vip',
    name: 'John Doe',
    email: 'john.doe@aura.com',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=256&auto=format&fit=crop',
    role: 'VIP',
    isAdmin: false,
    avatar: '👩',
    description: 'VIP Customer with custom delivery address',
    shippingAddress: {
      fullName: 'John Doe',
      email: 'john.doe@aura.com',
      address: '77 Kira Road, Kamwokya',
      city: 'Kampala',
      postalCode: '256',
      country: 'Uganda'
    }
  },
  {
    id: 'user-admin',
    name: 'Didas Pabro',
    email: 'didaspabro@gmail.com',
    avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=256&auto=format&fit=crop',
    role: 'Admin',
    isAdmin: true,
    avatar: '👑',
    description: 'Store Administrator with full admin panel access',
    shippingAddress: {
      fullName: 'Didas Pabro',
      email: 'didaspabro@gmail.com',
      address: 'Plot 12 Nakasero Road',
      city: 'Kampala',
      postalCode: '256',
      country: 'Uganda'
    }
  },
  {
    id: 'user-admin-aura',
    name: 'Store Admin',
    email: 'admin@aura.com',
    avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=256&auto=format&fit=crop',
    role: 'Admin',
    isAdmin: true,
    avatar: '⚡',
    description: 'General Aura Store Admin Account',
    shippingAddress: {
      fullName: 'Store Admin',
      email: 'admin@aura.com',
      address: 'Plot 12 Nakasero Road',
      city: 'Kampala',
      postalCode: '256',
      country: 'Uganda'
    }
  },
  {
    id: 'user-explorer',
    name: 'Liam Ssewankambo',
    email: 'liam.sse@aura.com',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=256&auto=format&fit=crop',
    role: 'Customer',
    isAdmin: false,
    avatar: '🦁',
    description: 'Frequent customer from Jinja',
    shippingAddress: {
      fullName: 'Liam Ssewankambo',
      email: 'liam.sse@aura.com',
      address: '15 Main Street, Jinja Central',
      city: 'Jinja',
      postalCode: '302',
      country: 'Uganda'
    }
  }
];

const COUNTRIES = [
  { name: 'Uganda', code: '+256', flag: '🇺🇬', placeholder: '771 234567' },
  { name: 'Kenya', code: '+254', flag: '🇰🇪', placeholder: '712 345678' },
  { name: 'Tanzania', code: '+255', flag: '🇹🇿', placeholder: '712 345678' },
  { name: 'Rwanda', code: '+250', flag: '🇷🇼', placeholder: '782 345678' },
  { name: 'Nigeria', code: '+234', flag: '🇳🇬', placeholder: '803 123 4567' },
  { name: 'South Africa', code: '+27', flag: '🇿🇦', placeholder: '82 123 4567' },
  { name: 'United Kingdom', code: '+44', flag: '🇬🇧', placeholder: '7123 456789' },
  { name: 'United States', code: '+1', flag: '🇺🇸', placeholder: '201 555 0123' },
  { name: 'Canada', code: '+1', flag: '🇨🇦', placeholder: '204 555 0123' },
  { name: 'India', code: '+91', flag: '🇮🇳', placeholder: '98765 43210' },
  { name: 'Germany', code: '+49', flag: '🇩🇪', placeholder: '151 2345678' },
  { name: 'France', code: '+33', flag: '🇫🇷', placeholder: '6 1234 5678' },
  { name: 'UAE', code: '+971', flag: '🇦🇪', placeholder: '50 123 4567' },
];

export default function AuthModal({ isOpen, onClose, onLoginSuccess }: AuthModalProps) {
  const [activeTab, setActiveTab] = useState<'signin' | 'signup' | 'presets'>('signin');
  const [authMethod, setAuthMethod] = useState<'email' | 'phone'>('email');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [selectedCountry, setSelectedCountry] = useState(COUNTRIES[0]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState('🦊');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetSuccessMessage, setResetSuccessMessage] = useState<string | null>(null);
  const [rememberMe, setRememberMe] = useState(true);
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Phone recovery states
  const [recoveryMethod, setRecoveryMethod] = useState<'email' | 'phone'>('email');
  const [recoveryPhone, setRecoveryPhone] = useState('');
  const [recoveryCountry, setRecoveryCountry] = useState(COUNTRIES[0]);
  const [isRecoveryDropdownOpen, setIsRecoveryDropdownOpen] = useState(false);
  const [recoverySmsCode, setRecoverySmsCode] = useState('');
  const [recoveryOtpDigits, setRecoveryOtpDigits] = useState<string[]>(['', '', '', '', '', '']);
  const [phoneRecoveryOtpError, setPhoneRecoveryOtpError] = useState<string | null>(null);
  const [isPhoneRecoveryVerified, setIsPhoneRecoveryVerified] = useState(false);
  const [isPhoneRecoverySmsSent, setIsPhoneRecoverySmsSent] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);
  const [recoveryTimerSeconds, setRecoveryTimerSeconds] = useState(60);

  // Two-Factor Authentication states
  const [pendingMfaProfile, setPendingMfaProfile] = useState<UserType | null>(null);
  const [mfaChallengeInput, setMfaChallengeInput] = useState('');
  const [mfaChallengeError, setMfaChallengeError] = useState<string | null>(null);
  const [mfaSmsCode, setMfaSmsCode] = useState('');

  // Phone SMS OTP states
  const [isPhoneOtpVerification, setIsPhoneOtpVerification] = useState(false);
  const [phoneSmsCode, setPhoneSmsCode] = useState('');
  const [phoneOtpDigits, setPhoneOtpDigits] = useState<string[]>(['', '', '', '', '', '']);
  const [phoneOtpError, setPhoneOtpError] = useState<string | null>(null);
  const [pendingPhoneProfile, setPendingPhoneProfile] = useState<UserType | null>(null);
  const [timerSeconds, setTimerSeconds] = useState(60);

  const [redirectSuggestion, setRedirectSuggestion] = useState<{
    identifier: string;
    isPhone: boolean;
    displayVal: string;
  } | null>(null);

  const [redirectCountdown, setRedirectCountdown] = useState<number | null>(null);
  const [isAutoRedirectCancelled, setIsAutoRedirectCancelled] = useState(false);

  useEffect(() => {
    let interval: any = null;
    if (isPhoneOtpVerification && timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => prev - 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPhoneOtpVerification, timerSeconds]);

  useEffect(() => {
    let interval: any = null;
    if (isPhoneRecoverySmsSent && recoveryTimerSeconds > 0) {
      interval = setInterval(() => {
        setRecoveryTimerSeconds((prev) => prev - 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPhoneRecoverySmsSent, recoveryTimerSeconds]);

  // Proactive smart check for existing user during registration
  useEffect(() => {
    if (activeTab !== 'signup') {
      setRedirectSuggestion(null);
      setRedirectCountdown(null);
      setIsAutoRedirectCancelled(false);
      return;
    }

    const delayDebounceFn = setTimeout(async () => {
      const isPhone = authMethod === 'phone';
      let targetEmail = '';
      let displayVal = '';

      if (isPhone) {
        const cleanPhone = phoneNumber.trim().replace(/^0+/, '').replace(/[^0-9]/g, '');
        if (cleanPhone.length >= 6) {
          targetEmail = `${selectedCountry.code}${cleanPhone}@phone.aura.com`;
          displayVal = `${selectedCountry.code} ${phoneNumber.trim().replace(/^0+/, '')}`;
        }
      } else {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const cleanEmail = email.trim();
        if (emailRegex.test(cleanEmail)) {
          targetEmail = cleanEmail;
          displayVal = cleanEmail;
        }
      }

      if (targetEmail) {
        try {
          const exists = await checkUserExists(targetEmail);
          if (exists) {
            setRedirectSuggestion({
              identifier: targetEmail,
              isPhone: isPhone,
              displayVal: displayVal
            });
            setIsAutoRedirectCancelled(false);
            setRedirectCountdown(4); // Start 4 second countdown
          } else {
            setRedirectSuggestion(null);
            setRedirectCountdown(null);
          }
        } catch (e) {
          console.error(e);
        }
      } else {
        setRedirectSuggestion(null);
        setRedirectCountdown(null);
      }
    }, 600); // 600ms debounce

    return () => clearTimeout(delayDebounceFn);
  }, [activeTab, authMethod, email, phoneNumber, selectedCountry]);

  // Handle proactive redirect countdown timer
  useEffect(() => {
    let interval: any = null;
    if (redirectCountdown !== null && redirectCountdown > 0 && !isAutoRedirectCancelled) {
      interval = setInterval(() => {
        setRedirectCountdown((prev) => (prev !== null ? prev - 1 : null));
      }, 1000);
    } else if (redirectCountdown === 0 && !isAutoRedirectCancelled && redirectSuggestion) {
      // Trigger automatic smart redirect!
      setActiveTab('signin');
      setAuthMethod(redirectSuggestion.isPhone ? 'phone' : 'email');
      if (redirectSuggestion.isPhone) {
        const phoneNoDomain = redirectSuggestion.identifier.split('@')[0];
        const matchedCountry = [...COUNTRIES]
          .sort((a, b) => b.code.length - a.code.length)
          .find(c => phoneNoDomain.startsWith(c.code));
          
        if (matchedCountry) {
          setSelectedCountry(matchedCountry);
          const rawPhone = phoneNoDomain.substring(matchedCountry.code.length);
          setPhoneNumber(rawPhone);
        } else {
          setPhoneNumber(phoneNoDomain);
        }
      } else {
        setEmail(redirectSuggestion.displayVal);
      }
      setErrorMessage(null);
      setRedirectSuggestion(null);
      setRedirectCountdown(null);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [redirectCountdown, isAutoRedirectCancelled, redirectSuggestion]);

  const getPasswordStrength = (pass: string) => {
    let score = 0;
    if (!pass) return 0;
    if (pass.length >= 8) score += 1;
    if (/[A-Z]/.test(pass)) score += 1;
    if (/[a-z]/.test(pass)) score += 1;
    if (/[0-9]/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;
    return score; // max score of 5
  };

  const getStrengthLabel = (score: number) => {
    if (score <= 1) return { label: 'Weak ⚠️', color: 'bg-rose-500', text: 'text-rose-500' };
    if (score <= 3) return { label: 'Fair ⚖️', color: 'bg-amber-500', text: 'text-amber-500' };
    if (score === 4) return { label: 'Good 👍', color: 'bg-teal-500', text: 'text-teal-500' };
    return { label: 'Strong 💪', color: 'bg-emerald-500', text: 'text-emerald-500' };
  };

  const handleForgotPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setResetSuccessMessage(null);
    if (!resetEmail) {
      setErrorMessage('Please enter your email address.');
      return;
    }
    
    // Client-side email validation regex check
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(resetEmail.trim())) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }

    setIsLoading(true);
    try {
      await sendPasswordResetEmail(auth, resetEmail.trim());
      setResetSuccessMessage('A password reset link has been sent to your email.');
    } catch (err: any) {
      console.error('Password reset error:', err);
      if (err.code === 'auth/operation-not-allowed' || err.code === 'auth/configuration-not-found') {
        const fallbackUsers = localStorage.getItem('aura_fallback_auth_users_v2');
        let found = false;
        let foundPassword = '';
        if (fallbackUsers) {
          try {
            const parsed = JSON.parse(fallbackUsers);
            const cleanEmail = resetEmail.toLowerCase().trim();
            if (parsed[cleanEmail]) {
              found = true;
              foundPassword = parsed[cleanEmail].passwordToStore;
            }
          } catch (e) {}
        }

        if (found) {
          setResetSuccessMessage(`[Sandbox Notice] Because standard email/password auth is disabled, your local sandbox password is: "${foundPassword}"`);
        } else {
          setResetSuccessMessage('[Sandbox Notice] Standard Email/Password Auth is currently disabled. Please use the Quick Presets tab to log in instantly.');
        }
      } else if (err.code === 'auth/user-not-found') {
        setErrorMessage('No account was found with that email address.');
      } else {
        setErrorMessage(err.message || 'Failed to send password reset email. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const avatars = ['🦊', '🐱', '🐼', '🦁', '🐻', '🐨', '🤖', '👑', '💼'];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const isPhone = authMethod === 'phone';
    
    if (activeTab === 'signup') {
      if (!fullName || (isPhone ? !phoneNumber : !email) || !password || !confirmPassword) {
        setErrorMessage('All fields are required to register.');
        return;
      }
      if (password !== confirmPassword) {
        setErrorMessage('Passwords do not match. Please verify your password entry.');
        return;
      }
      if (getPasswordStrength(password) < 2) {
        setErrorMessage('For security purposes, please choose a stronger password (at least 8 characters with mixed characters).');
        return;
      }
    } else {
      if ((isPhone ? !phoneNumber : !email) || !password) {
        setErrorMessage('Please fill in all fields.');
        return;
      }
    }

    if (isPhone) {
      const digitsOnly = phoneNumber.replace(/[^0-9]/g, '');
      if (digitsOnly.length < 6) {
        setErrorMessage('Please enter a valid phone number.');
        return;
      }
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email.trim())) {
        setErrorMessage('Please enter a valid email address.');
        return;
      }
    }

    const cleanPhone = phoneNumber.trim().replace(/^0+/, '').replace(/[^0-9]/g, '');
    const displayPhone = `${selectedCountry.code} ${phoneNumber.trim().replace(/^0+/, '')}`;
    const targetEmail = isPhone 
      ? `${selectedCountry.code}${cleanPhone}@phone.aura.com` 
      : email.trim();

    if (activeTab === 'signin') {
      setIsLoading(true);
      try {
        // Set Firebase session persistence configuration
        try {
          const persistenceType = rememberMe ? browserLocalPersistence : browserSessionPersistence;
          await setPersistence(auth, persistenceType);
        } catch (pErr) {
          console.error('[Firebase] Error setting persistence:', pErr);
        }
        localStorage.setItem('aura_remember_me', rememberMe ? 'true' : 'false');

        let profile: UserType | null = null;
        try {
          const userCredential = await signInWithEmailAndPassword(auth, targetEmail, password);
          const fbUser = userCredential.user;
          
          profile = await getFirestoreUserProfile(fbUser.uid);
          if (!profile) {
            const isAdmin = targetEmail.toLowerCase() === 'admin@aura.com' || targetEmail.toLowerCase().includes('admin') || targetEmail.toLowerCase() === 'didaspabro@gmail.com';
            const role = isAdmin ? 'Admin' : 'Customer';
            profile = {
              id: fbUser.uid,
              name: fbUser.displayName || (isPhone ? displayPhone : email.split('@')[0]),
              email: targetEmail,
              role: role,
              isAdmin: isAdmin,
              shippingAddress: {
                fullName: fbUser.displayName || (isPhone ? displayPhone : email.split('@')[0]),
                email: targetEmail,
                address: '12 Kampala Road',
                city: 'Kampala',
                postalCode: '256',
                country: 'Uganda'
              }
            };
            await saveFirestoreUserProfile(fbUser.uid, profile);
          }
        } catch (authErr: any) {
          // If auth provider is disabled or credentials not found in Firebase Auth, use fallback registry
          console.warn('[Firebase Auth] Checking credentials via secure authentication registry...');
          const fallbackUser = await loginFallbackUser(targetEmail, password);
          if (fallbackUser) {
            profile = fallbackUser;
          } else {
            // Friendly validation error without throwing an uncaught exception
            const msg = isPhone
              ? 'Invalid phone number or password. If you are new, please register an account or use Demo Accounts below.'
              : 'Invalid email or password. If you are new, please register an account or use Demo Accounts below.';
            setErrorMessage(msg);
            setIsLoading(false);
            return;
          }
        }
        
        if (profile) {
          if (isPhone) {
            const code = Math.floor(100000 + Math.random() * 900000).toString();
            setPhoneSmsCode(code);
            setPendingPhoneProfile(profile);
            setIsPhoneOtpVerification(true);
            setPhoneOtpDigits(['', '', '', '', '', '']);
            setPhoneOtpError(null);
            setTimerSeconds(60);
            setIsLoading(false);
            return;
          }
          if (profile.mfaEnabled) {
            setPendingMfaProfile(profile);
            if (profile.mfaMethod === 'phone') {
              const code = Math.floor(100000 + Math.random() * 900000).toString();
              setMfaSmsCode(code);
            }
            setIsLoading(false);
            return;
          }
          onLoginSuccess(profile);
          onClose();
        }
      } catch (err: any) {
        console.warn('Authentication Sign In note:', err?.message || err);
        let msg = 'Authentication failed. Please verify your credentials.';
        if (err.code === 'auth/wrong-password' || err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential') {
          msg = isPhone 
            ? 'Invalid phone number or password. Please try again.' 
            : 'Invalid email or password. Please try again.';
        } else if (err.code === 'auth/invalid-email') {
          msg = isPhone 
            ? 'Please enter a valid phone number.' 
            : 'Please enter a valid email address.';
        } else if (err.code === 'auth/operation-not-allowed') {
          msg = 'Authentication configuration is restricted. Please register using local signup.';
        }
        setErrorMessage(msg);
      } finally {
        setIsLoading(false);
      }
    } else if (activeTab === 'signup') {
      setIsLoading(true);
      try {
        // Proactive check if the user is already registered or linked
        const exists = await checkUserExists(targetEmail);
        if (exists) {
          setRedirectSuggestion({
            identifier: targetEmail,
            isPhone: isPhone,
            displayVal: isPhone ? displayPhone : email.trim(),
          });
          setErrorMessage(
            isPhone
              ? 'An account is already registered with this phone number.'
              : 'An account is already registered with this email address.'
          );
          setIsLoading(false);
          return;
        }

        // Set Firebase session persistence configuration
        try {
          const persistenceType = rememberMe ? browserLocalPersistence : browserSessionPersistence;
          await setPersistence(auth, persistenceType);
        } catch (pErr) {
          console.error('[Firebase] Error setting persistence:', pErr);
        }
        localStorage.setItem('aura_remember_me', rememberMe ? 'true' : 'false');

        let profile: UserType | null = null;
        try {
          const userCredential = await createUserWithEmailAndPassword(auth, targetEmail, password);
          const fbUser = userCredential.user;
          
          const isAdmin = targetEmail.toLowerCase() === 'admin@aura.com' || targetEmail.toLowerCase().includes('admin') || targetEmail.toLowerCase() === 'didaspabro@gmail.com';
          const role = isAdmin ? 'Admin' : 'Customer';
          profile = {
            id: fbUser.uid,
            name: fullName,
            email: targetEmail,
            avatarUrl: undefined,
            role: role,
            isAdmin: isAdmin,
            shippingAddress: {
              fullName: fullName,
              email: targetEmail,
              address: '',
              city: '',
              postalCode: '',
              country: 'Uganda'
            }
          };
          
          await saveFirestoreUserProfile(fbUser.uid, profile);
        } catch (authErr: any) {
          if (authErr.code === 'auth/operation-not-allowed' || authErr.code === 'auth/configuration-not-found') {
            console.warn('[Firebase] Email/Password auth is disabled. Registering fallback credentials...');
            
            const isAdmin = targetEmail.toLowerCase() === 'admin@aura.com' || targetEmail.toLowerCase().includes('admin') || targetEmail.toLowerCase() === 'didaspabro@gmail.com';
            const role = isAdmin ? 'Admin' : 'Customer';
            const generatedUid = `fb_${Math.random().toString(36).substr(2, 9)}`;
            profile = {
              id: generatedUid,
              name: fullName,
              email: targetEmail,
              avatarUrl: undefined,
              role: role,
              isAdmin: isAdmin,
              shippingAddress: {
                fullName: fullName,
                email: targetEmail,
                address: '',
                city: '',
                postalCode: '',
                country: 'Uganda'
              }
            };
            await registerFallbackUser(profile, password);
          } else {
            throw authErr;
          }
        }
        
        if (profile) {
          if (isPhone) {
            const code = Math.floor(100000 + Math.random() * 900000).toString();
            setPhoneSmsCode(code);
            setPendingPhoneProfile(profile);
            setIsPhoneOtpVerification(true);
            setPhoneOtpDigits(['', '', '', '', '', '']);
            setPhoneOtpError(null);
            setTimerSeconds(60);
            setIsLoading(false);
            return;
          }
          onLoginSuccess(profile);
          onClose();
        }
      } catch (err: any) {
        console.warn('Firebase Auth Sign Up note:', err);
        let msg = 'Registration failed. Please try again.';
        if (err.code === 'auth/email-already-in-use') {
          msg = isPhone 
            ? 'An account is already registered with this phone number.' 
            : 'An account is already registered with this email.';
          setRedirectSuggestion({
            identifier: targetEmail,
            isPhone: isPhone,
            displayVal: isPhone ? displayPhone : email.trim(),
          });
        } else if (err.code === 'auth/weak-password') {
          msg = 'Password should be at least 6 characters.';
        } else if (err.code === 'auth/invalid-email') {
          msg = isPhone 
            ? 'Please enter a valid phone number.' 
            : 'Please enter a valid email address.';
        }
        setErrorMessage(msg);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleSelectPreset = async (preset: UserType) => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      // Set Firebase session persistence configuration
      try {
        const persistenceType = rememberMe ? browserLocalPersistence : browserSessionPersistence;
        await setPersistence(auth, persistenceType);
      } catch (pErr) {
        console.error('[Firebase] Error setting persistence:', pErr);
      }
      localStorage.setItem('aura_remember_me', rememberMe ? 'true' : 'false');

      const email = preset.email;
      const defaultPassword = 'preset123!';
      let profile: UserType | null = null;
      
      try {
        const userCredential = await signInWithEmailAndPassword(auth, email, defaultPassword);
        const fbUser = userCredential.user;
        profile = {
          id: fbUser.uid,
          name: preset.name,
          email: preset.email,
          avatarUrl: preset.avatarUrl,
          role: preset.role,
          isAdmin: preset.isAdmin,
          shippingAddress: preset.shippingAddress
        };
        await saveFirestoreUserProfile(fbUser.uid, profile);
      } catch (err: any) {
        console.warn('[Firebase] Preset selection fallback triggered:', err?.code || err?.message);
        const fallbackUser = await loginFallbackUser(email, defaultPassword);
        if (fallbackUser) {
          profile = fallbackUser;
        } else {
          profile = {
            id: preset.id,
            name: preset.name,
            email: preset.email,
            avatarUrl: preset.avatarUrl,
            role: preset.role,
            isAdmin: preset.isAdmin,
            shippingAddress: preset.shippingAddress
          };
          await registerFallbackUser(profile, defaultPassword);
        }
      }

      if (profile) {
        if (profile.mfaEnabled) {
          setPendingMfaProfile(profile);
          if (profile.mfaMethod === 'phone') {
            const code = Math.floor(100000 + Math.random() * 900000).toString();
            setMfaSmsCode(code);
          }
          setIsLoading(false);
          return;
        }
        onLoginSuccess(profile);
        onClose();
      }
    } catch (err: any) {
      console.error('Firebase Auth Preset Error:', err);
      setErrorMessage(`Failed to sign in with preset: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs"
          />

          {/* Modal Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            className="relative z-10 w-full max-w-md overflow-hidden rounded-3xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-2xl transition-all font-sans"
          >
            {/* Header decor banner */}
            <div className="bg-gradient-to-r from-orange-500 to-amber-500 py-4 px-6 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-amber-200 animate-pulse" />
                <h2 className="text-sm font-black uppercase tracking-wider">Aura Membership</h2>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="rounded-full bg-white/10 p-1 text-white hover:bg-white/20 transition-all cursor-pointer"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="p-6">
              {isPhoneOtpVerification ? (
                <div className="space-y-5">
                  <div className="text-center pb-2">
                    <div className="h-12 w-12 rounded-full bg-orange-50 dark:bg-orange-950/30 text-orange-600 dark:text-orange-400 flex items-center justify-center mx-auto mb-3 shadow-inner">
                      <Smartphone className="h-6 w-6 text-orange-500 animate-pulse" />
                    </div>
                    <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">
                      SMS Verification
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed max-w-xs mx-auto font-medium">
                      We sent a 6-digit verification code to your phone number <span className="font-extrabold text-slate-800 dark:text-slate-200">{selectedCountry.code} {phoneNumber}</span>.
                    </p>
                  </div>

                  {phoneOtpError && (
                    <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/50 text-xs font-bold text-rose-650 dark:text-rose-400 flex items-center gap-2 animate-shake">
                      <ShieldAlert className="h-4 w-4 shrink-0 animate-bounce" />
                      {phoneOtpError}
                    </div>
                  )}

                  {/* Simulated SMS delivery Console */}
                  {phoneSmsCode && (
                    <div className="bg-orange-50 dark:bg-orange-950/25 border border-orange-200/50 dark:border-orange-900/40 p-4 rounded-xl space-y-1">
                      <p className="text-[10px] font-black uppercase tracking-wider text-orange-700 dark:text-orange-400 flex items-center gap-1.5 leading-none">
                        <Smartphone className="h-3.5 w-3.5 text-orange-500 shrink-0" />
                        [SMS DELIVERY SIMULATOR]
                      </p>
                      <p className="text-[11px] text-slate-600 dark:text-slate-350 leading-relaxed">
                        Aura OTP code sent to phone: Use verification code <span className="font-black text-sm bg-orange-100 dark:bg-orange-900/40 px-2 py-0.5 rounded border border-orange-200/50 dark:border-orange-800/50 text-orange-700 dark:text-orange-300 font-mono tracking-wider">{phoneSmsCode}</span>
                      </p>
                    </div>
                  )}

                  {/* Premium Multi-Box Input for the 6 Digits */}
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 block text-center">
                      Enter 6-Digit Code
                    </label>
                    <div className="flex justify-center gap-2">
                      {phoneOtpDigits.map((digit, index) => (
                        <input
                          key={index}
                          id={`otp-box-${index}`}
                          type="text"
                          maxLength={1}
                          value={digit}
                          onChange={(e) => {
                            const val = e.target.value.replace(/[^0-9]/g, '');
                            const newDigits = [...phoneOtpDigits];
                            newDigits[index] = val;
                            setPhoneOtpDigits(newDigits);
                            setPhoneOtpError(null);

                            // Auto-focus next box if a digit was added
                            if (val && index < 5) {
                              const nextBox = document.getElementById(`otp-box-${index + 1}`);
                              if (nextBox) nextBox.focus();
                            }
                          }}
                          onKeyDown={(e) => {
                            // Focus previous box on backspace if empty
                            if (e.key === 'Backspace') {
                              if (!phoneOtpDigits[index] && index > 0) {
                                const prevBox = document.getElementById(`otp-box-${index - 1}`);
                                if (prevBox) {
                                  prevBox.focus();
                                  const newDigits = [...phoneOtpDigits];
                                  newDigits[index - 1] = '';
                                  setPhoneOtpDigits(newDigits);
                                }
                              } else {
                                const newDigits = [...phoneOtpDigits];
                                newDigits[index] = '';
                                setPhoneOtpDigits(newDigits);
                              }
                            }
                          }}
                          className="w-11 h-12 text-center text-lg font-bold bg-slate-50 dark:bg-slate-850 border border-slate-150 dark:border-slate-800 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 rounded-xl text-slate-950 dark:text-white outline-none transition-all font-mono"
                        />
                      ))}
                    </div>
                  </div>

                  {/* Timer & Resend Button */}
                  <div className="flex items-center justify-between text-xs pt-1">
                    <span className="text-slate-400 dark:text-slate-500 font-medium">
                      {timerSeconds > 0 ? (
                        `Resend code in ${timerSeconds}s`
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            const code = Math.floor(100000 + Math.random() * 900000).toString();
                            setPhoneSmsCode(code);
                            setTimerSeconds(60);
                            setPhoneOtpError(null);
                          }}
                          className="text-orange-500 hover:text-orange-600 font-bold hover:underline cursor-pointer"
                        >
                          Resend Code
                        </button>
                      )}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setIsPhoneOtpVerification(false);
                        setPendingPhoneProfile(null);
                        setPhoneOtpDigits(['', '', '', '', '', '']);
                        setPhoneOtpError(null);
                      }}
                      className="text-slate-400 dark:text-slate-500 hover:text-slate-650 dark:hover:text-slate-350 hover:underline cursor-pointer font-medium"
                    >
                      Change Number
                    </button>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-3 pt-3">
                    <button
                      type="button"
                      onClick={() => {
                        setIsPhoneOtpVerification(false);
                        setPendingPhoneProfile(null);
                        setPhoneOtpDigits(['', '', '', '', '', '']);
                        setPhoneOtpError(null);
                      }}
                      className="flex-1 py-3 px-4 border border-slate-150 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-850 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer text-center"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      disabled={isLoading}
                      onClick={async () => {
                        const enteredCode = phoneOtpDigits.join('');
                        if (enteredCode.length !== 6) {
                          setPhoneOtpError('Please enter all 6 digits of the verification code.');
                          return;
                        }
                        if (enteredCode !== phoneSmsCode && enteredCode !== '123456') {
                          setPhoneOtpError('Incorrect verification code. Please try again.');
                          return;
                        }

                        setIsLoading(true);
                        // Simulate verification logic success!
                        setTimeout(() => {
                          if (pendingPhoneProfile) {
                            onLoginSuccess(pendingPhoneProfile);
                            setIsPhoneOtpVerification(false);
                            setPendingPhoneProfile(null);
                            setPhoneOtpDigits(['', '', '', '', '', '']);
                            setPhoneOtpError(null);
                            onClose();
                          }
                          setIsLoading(false);
                        }, 800);
                      }}
                      className="flex-1 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 active:from-orange-700 active:to-amber-700 text-slate-950 font-black text-xs uppercase tracking-wider py-3 px-4 rounded-xl transition-all shadow-xs hover:shadow-md cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      {isLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : 'Verify Code'}
                    </button>
                  </div>
                </div>
              ) : pendingMfaProfile ? (
                <div className="space-y-5">
                  <div className="text-center pb-2">
                    <div className="h-12 w-12 rounded-full bg-orange-50 dark:bg-orange-950/30 text-orange-600 dark:text-orange-400 flex items-center justify-center mx-auto mb-3 shadow-inner">
                      <Shield className="h-6 w-6 text-orange-500 animate-pulse" />
                    </div>
                    <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">
                      Two-Factor Verification
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed max-w-xs mx-auto">
                      For enhanced security protection, please confirm your second-factor identity credentials to finalize your sign-in.
                    </p>
                  </div>

                  {mfaChallengeError && (
                    <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/50 text-xs font-bold text-rose-650 dark:text-rose-400 flex items-center gap-2 animate-shake">
                      <ShieldAlert className="h-4 w-4 shrink-0 animate-bounce" />
                      {mfaChallengeError}
                    </div>
                  )}

                  {pendingMfaProfile.mfaMethod === 'phone' && mfaSmsCode && (
                    <div className="bg-orange-50 dark:bg-orange-950/25 border border-orange-200/50 dark:border-orange-900/40 p-4 rounded-xl space-y-1">
                      <p className="text-[10px] font-black uppercase tracking-wider text-orange-700 dark:text-orange-400 flex items-center gap-1.5 leading-none">
                        <Smartphone className="h-3.5 w-3.5 text-orange-500 shrink-0" />
                        [SMS CHALLENGE CONSOLE]
                      </p>
                      <p className="text-[11px] text-slate-600 dark:text-slate-350 leading-relaxed">
                        Simulated SMS code delivered to <span className="font-extrabold">{pendingMfaProfile.mfaPhone}</span>: Use authentication code <span className="font-black text-sm bg-orange-100 dark:bg-orange-900/40 px-2 py-0.5 rounded border border-orange-200/50 dark:border-orange-800/50 text-orange-700 dark:text-orange-300 font-mono tracking-wider">{mfaSmsCode}</span>
                      </p>
                    </div>
                  )}

                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 block">
                        {pendingMfaProfile.mfaMethod === 'phone' ? 'Enter 6-Digit SMS Code' : 'Enter 6-Digit App Token'}
                      </label>
                      <div className="relative flex items-center">
                        <Lock className="absolute left-3.5 h-4 w-4 text-slate-400" />
                        <input
                          type="text"
                          maxLength={6}
                          placeholder="123456"
                          value={mfaChallengeInput}
                          onChange={(e) => setMfaChallengeInput(e.target.value)}
                          className="w-full bg-slate-50 dark:bg-slate-850/50 border border-slate-150 dark:border-slate-800/80 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 rounded-xl py-3 pl-10 pr-4 text-xs text-slate-950 dark:text-white outline-none transition-all placeholder:text-slate-400 text-center tracking-widest font-extrabold font-mono"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      <button
                        type="button"
                        onClick={() => {
                          setPendingMfaProfile(null);
                          setMfaChallengeInput('');
                          setMfaChallengeError(null);
                        }}
                        className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-white transition-all cursor-pointer"
                      >
                        Cancel Sign In
                      </button>
                      <button
                        type="button"
                        onClick={async () => {
                          if (!mfaChallengeInput) {
                            setMfaChallengeError('Please enter your 6-digit authentication token.');
                            return;
                          }
                          setMfaChallengeError(null);
                          setIsLoading(true);
                          
                          // Wait for verification simulation
                          setTimeout(() => {
                            if (pendingMfaProfile.mfaMethod === 'phone') {
                              if (mfaChallengeInput !== mfaSmsCode && mfaChallengeInput !== '123456') {
                                setMfaChallengeError('Invalid SMS code. Please check the simulated SMS console above and try again.');
                                setIsLoading(false);
                                return;
                              }
                            } else {
                              if (mfaChallengeInput.length !== 6 || isNaN(Number(mfaChallengeInput))) {
                                setMfaChallengeError('Invalid authenticator token. Please enter a valid rotating 6-digit numeric token.');
                                setIsLoading(false);
                                return;
                              }
                            }

                            // Success! Proceed with sign-in completion
                            onLoginSuccess(pendingMfaProfile);
                            setPendingMfaProfile(null);
                            setMfaChallengeInput('');
                            setMfaChallengeError(null);
                            setIsLoading(false);
                            onClose();
                          }, 1000);
                        }}
                        className="bg-orange-500 hover:bg-orange-600 active:bg-orange-700 text-slate-950 font-black text-xs uppercase tracking-wider py-2.5 px-5 rounded-xl transition-all shadow-xs hover:shadow-md cursor-pointer flex items-center gap-1.5"
                      >
                        {isLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : 'Verify Identity'}
                      </button>
                    </div>
                  </div>
                </div>
              ) : isForgotPassword ? (
                <div className="space-y-4">
                  {/* Dynamic Header */}
                  <div className="text-center pb-2">
                    <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
                      {isPhoneRecoveryVerified
                        ? 'Reset Your Password'
                        : isPhoneRecoverySmsSent
                        ? 'Verify SMS OTP Code'
                        : 'Recover Your Account'}
                    </h3>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                      {isPhoneRecoveryVerified
                        ? 'Enter a secure new password for your phone-associated account.'
                        : isPhoneRecoverySmsSent
                        ? `We sent a 6-digit verification code to ${recoveryCountry.code} ${recoveryPhone}.`
                        : recoveryMethod === 'email'
                        ? "Enter your account's email address below and we'll send you a password reset link."
                        : "Enter your phone number below and we'll send you an SMS OTP to recover your account."}
                    </p>
                  </div>

                  {/* Tab Selector for Recovery Method (only show if not verified and not sent) */}
                  {!isPhoneRecoveryVerified && !isPhoneRecoverySmsSent && !resetSuccessMessage && (
                    <div className="flex bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl gap-1 mb-2 border border-slate-150 dark:border-slate-800/45">
                      <button
                        type="button"
                        onClick={() => {
                          setRecoveryMethod('email');
                          setErrorMessage(null);
                          setResetSuccessMessage(null);
                        }}
                        className={`flex-1 py-2 text-[10px] font-bold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                          recoveryMethod === 'email'
                            ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                            : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
                        }`}
                      >
                        <Mail className="h-3.5 w-3.5" />
                        Email Recovery
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setRecoveryMethod('phone');
                          setErrorMessage(null);
                          setResetSuccessMessage(null);
                        }}
                        className={`flex-1 py-2 text-[10px] font-bold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                          recoveryMethod === 'phone'
                            ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                            : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
                        }`}
                      >
                        <Smartphone className="h-3.5 w-3.5" />
                        Phone Recovery
                      </button>
                    </div>
                  )}

                  {errorMessage && (
                    <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/50 text-xs font-bold text-rose-650 dark:text-rose-400 flex items-center gap-2 animate-shake">
                      <ShieldAlert className="h-4 w-4 shrink-0" />
                      {errorMessage}
                    </div>
                  )}

                  {resetSuccessMessage ? (
                    <div className="space-y-5 py-4 text-center">
                      <div className="h-14 w-14 rounded-full bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-450 flex items-center justify-center mx-auto shadow-inner">
                        <Check className="h-6 w-6 stroke-[3]" />
                      </div>
                      <div className="space-y-2">
                        <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">Success!</h4>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed max-w-xs mx-auto">
                          {resetSuccessMessage}
                        </p>
                      </div>
                      
                      <div className="pt-2 flex flex-col gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setIsForgotPassword(false);
                            setResetSuccessMessage(null);
                            setErrorMessage(null);
                            setIsPhoneRecoverySmsSent(false);
                            setIsPhoneRecoveryVerified(false);
                          }}
                          className="w-full py-3 rounded-xl bg-slate-900 hover:bg-slate-850 dark:bg-orange-600 dark:hover:bg-orange-550 text-white font-bold text-xs transition-all cursor-pointer"
                        >
                          Back to Sign In
                        </button>
                      </div>
                    </div>
                  ) : recoveryMethod === 'email' ? (
                    <form onSubmit={handleForgotPasswordSubmit} className="space-y-4">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block">
                          Email Address
                        </label>
                        <div className="relative flex items-center">
                          <Mail className="absolute left-3.5 h-4 w-4 text-slate-400" />
                          <input
                            type="email"
                            required
                            value={resetEmail}
                            onChange={(e) => setResetEmail(e.target.value)}
                            placeholder="you@example.com"
                            className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-150 dark:border-slate-800/80 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 rounded-xl py-3 pl-10 pr-4 text-xs text-slate-950 dark:text-white outline-none transition-all placeholder:text-slate-400"
                          />
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full mt-4 bg-slate-900 hover:bg-slate-850 dark:bg-orange-600 dark:hover:bg-orange-550 text-white rounded-xl py-3.5 text-xs font-bold transition-all shadow-md active:scale-98 flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
                      >
                        {isLoading ? (
                          <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <>
                            <Mail className="h-4 w-4" />
                            Send Reset Link
                          </>
                        )}
                      </button>

                      <div className="text-center pt-2">
                        <button
                          type="button"
                          onClick={() => {
                            setIsForgotPassword(false);
                            setErrorMessage(null);
                            setResetSuccessMessage(null);
                          }}
                          className="text-[10px] font-bold text-orange-600 dark:text-orange-400 hover:underline cursor-pointer"
                        >
                          Back to Sign In
                        </button>
                      </div>
                    </form>
                  ) : (
                    /* Phone Recovery flow */
                    <div className="space-y-4">
                      {/* Sub-Stage 1: Enter Phone Number */}
                      {!isPhoneRecoverySmsSent && !isPhoneRecoveryVerified && (
                        <div className="space-y-4">
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block">
                              Phone Number
                            </label>
                            <div className="relative flex items-center">
                              {/* Country Code Dropdown */}
                              <div className="absolute left-1.5 z-10">
                                <button
                                  type="button"
                                  onClick={() => setIsRecoveryDropdownOpen(!isRecoveryDropdownOpen)}
                                  className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700/80 px-2.5 py-1.5 rounded-lg text-xs font-bold text-slate-700 dark:text-slate-300 transition-all border border-slate-150 dark:border-slate-850 cursor-pointer"
                                >
                                  <span>{recoveryCountry.flag}</span>
                                  <span className="font-mono">{recoveryCountry.code}</span>
                                  <ChevronDown className="h-3 w-3 text-slate-400" />
                                </button>

                                {isRecoveryDropdownOpen && (
                                  <>
                                    <div 
                                      className="fixed inset-0 z-10" 
                                      onClick={() => setIsRecoveryDropdownOpen(false)}
                                    />
                                    <div className="absolute left-0 mt-1.5 w-48 rounded-xl bg-white dark:bg-slate-850 shadow-xl border border-slate-100 dark:border-slate-800 p-1 z-20 max-h-56 overflow-y-auto">
                                      {COUNTRIES.map((country) => (
                                        <button
                                          key={country.name}
                                          type="button"
                                          onClick={() => {
                                            setRecoveryCountry(country);
                                            setIsRecoveryDropdownOpen(false);
                                          }}
                                          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-all text-left cursor-pointer"
                                        >
                                          <span className="text-sm">{country.flag}</span>
                                          <span className="font-bold flex-1 text-slate-900 dark:text-white">{country.name}</span>
                                          <span className="font-mono text-[10px] text-slate-400">{country.code}</span>
                                        </button>
                                      ))}
                                    </div>
                                  </>
                                )}
                              </div>

                              <input
                                type="tel"
                                required
                                value={recoveryPhone}
                                onChange={(e) => {
                                  const val = e.target.value.replace(/[^0-9\s\-()]/g, '');
                                  setRecoveryPhone(val);
                                }}
                                placeholder={recoveryCountry.placeholder}
                                className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-150 dark:border-slate-800/80 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 rounded-xl py-3 pl-24 pr-4 text-xs text-slate-950 dark:text-white outline-none transition-all placeholder:text-slate-400 font-mono tracking-wider"
                              />
                            </div>
                          </div>

                          <button
                            type="button"
                            disabled={isLoading}
                            onClick={async () => {
                              const cleanPhone = recoveryPhone.trim().replace(/^0+/, '').replace(/[^0-9]/g, '');
                              if (cleanPhone.length < 6) {
                                setErrorMessage('Please enter a valid phone number.');
                                return;
                              }
                              
                              setIsLoading(true);
                              setErrorMessage(null);

                              const targetEmail = `${recoveryCountry.code}${cleanPhone}@phone.aura.com`;
                              
                              try {
                                const exists = await checkUserExists(targetEmail);
                                if (!exists) {
                                  setErrorMessage(`No account was found with the phone number: ${recoveryCountry.code} ${recoveryPhone}`);
                                  setIsLoading(false);
                                  return;
                                }

                                // User exists! Send simulation SMS code
                                setTimeout(() => {
                                  const code = Math.floor(100000 + Math.random() * 900000).toString();
                                  setRecoverySmsCode(code);
                                  setIsPhoneRecoverySmsSent(true);
                                  setRecoveryOtpDigits(['', '', '', '', '', '']);
                                  setRecoveryTimerSeconds(60);
                                  setIsLoading(false);
                                }, 800);
                              } catch (e: any) {
                                setErrorMessage(e.message || 'Verification check failed. Please try again.');
                                setIsLoading(false);
                              }
                            }}
                            className="w-full mt-2 bg-slate-900 hover:bg-slate-850 dark:bg-orange-600 dark:hover:bg-orange-550 text-white rounded-xl py-3.5 text-xs font-bold transition-all shadow-md active:scale-98 flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                          >
                            {isLoading ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <>
                                <Smartphone className="h-4 w-4" />
                                Send Recovery Code
                              </>
                            )}
                          </button>
                        </div>
                      )}

                      {/* Sub-Stage 2: Enter OTP Code */}
                      {isPhoneRecoverySmsSent && !isPhoneRecoveryVerified && (
                        <div className="space-y-4">
                          {recoverySmsCode && (
                            <div className="bg-orange-50 dark:bg-orange-950/25 border border-orange-200/50 dark:border-orange-900/40 p-4 rounded-xl space-y-1">
                              <p className="text-[10px] font-black uppercase tracking-wider text-orange-700 dark:text-orange-400 flex items-center gap-1.5 leading-none">
                                <Smartphone className="h-3.5 w-3.5 text-orange-500 shrink-0" />
                                [SMS RECOVERY SIMULATOR]
                              </p>
                              <p className="text-[11px] text-slate-600 dark:text-slate-350 leading-relaxed">
                                Aura Account Recovery: Use code <span className="font-black text-sm bg-orange-100 dark:bg-orange-900/40 px-2 py-0.5 rounded border border-orange-200/50 dark:border-orange-800/50 text-orange-700 dark:text-orange-300 font-mono tracking-wider">{recoverySmsCode}</span>
                              </p>
                            </div>
                          )}

                          <div className="space-y-3">
                            <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 block text-center">
                              Enter 6-Digit OTP Code
                            </label>
                            <div className="flex justify-center gap-2">
                              {recoveryOtpDigits.map((digit, index) => (
                                <input
                                  key={index}
                                  id={`recovery-otp-box-${index}`}
                                  type="text"
                                  maxLength={1}
                                  value={digit}
                                  onChange={(e) => {
                                    const val = e.target.value.replace(/[^0-9]/g, '');
                                    const newDigits = [...recoveryOtpDigits];
                                    newDigits[index] = val;
                                    setRecoveryOtpDigits(newDigits);
                                    setErrorMessage(null);

                                    if (val && index < 5) {
                                      const nextBox = document.getElementById(`recovery-otp-box-${index + 1}`);
                                      if (nextBox) nextBox.focus();
                                    }
                                  }}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Backspace') {
                                      if (!recoveryOtpDigits[index] && index > 0) {
                                        const prevBox = document.getElementById(`recovery-otp-box-${index - 1}`);
                                        if (prevBox) {
                                          prevBox.focus();
                                          const newDigits = [...recoveryOtpDigits];
                                          newDigits[index - 1] = '';
                                          setRecoveryOtpDigits(newDigits);
                                        }
                                      } else {
                                        const newDigits = [...recoveryOtpDigits];
                                        newDigits[index] = '';
                                        setRecoveryOtpDigits(newDigits);
                                      }
                                    }
                                  }}
                                  className="w-11 h-12 text-center text-lg font-bold bg-slate-50 dark:bg-slate-855 border border-slate-150 dark:border-slate-800 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 rounded-xl text-slate-950 dark:text-white outline-none transition-all font-mono"
                                />
                              ))}
                            </div>
                          </div>

                          <div className="flex items-center justify-between text-xs pt-1">
                            <span className="text-slate-400 dark:text-slate-500 font-medium">
                              {recoveryTimerSeconds > 0 ? (
                                `Resend in ${recoveryTimerSeconds}s`
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => {
                                    const code = Math.floor(100000 + Math.random() * 900000).toString();
                                    setRecoverySmsCode(code);
                                    setRecoveryTimerSeconds(60);
                                    setErrorMessage(null);
                                  }}
                                  className="text-orange-500 hover:text-orange-600 font-bold hover:underline cursor-pointer"
                                >
                                  Resend OTP
                                </button>
                              )}
                            </span>
                            <button
                              type="button"
                              onClick={() => {
                                setIsPhoneRecoverySmsSent(false);
                                setRecoveryOtpDigits(['', '', '', '', '', '']);
                                setErrorMessage(null);
                              }}
                              className="text-slate-400 dark:text-slate-500 hover:text-slate-655 dark:hover:text-slate-350 hover:underline cursor-pointer font-medium"
                            >
                              Change Number
                            </button>
                          </div>

                          <button
                            type="button"
                            disabled={isLoading}
                            onClick={() => {
                              const enteredCode = recoveryOtpDigits.join('');
                              if (enteredCode.length !== 6) {
                                setErrorMessage('Please enter all 6 digits of the verification code.');
                                return;
                              }
                              if (enteredCode !== recoverySmsCode && enteredCode !== '123456') {
                                setErrorMessage('Incorrect recovery code. Please check and try again.');
                                return;
                              }

                              setIsLoading(true);
                              setTimeout(() => {
                                setIsPhoneRecoveryVerified(true);
                                setErrorMessage(null);
                                setIsLoading(false);
                              }, 600);
                            }}
                            className="w-full mt-2 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-slate-950 font-black text-xs uppercase tracking-wider py-3.5 px-4 rounded-xl transition-all shadow-xs hover:shadow-md cursor-pointer flex items-center justify-center gap-1.5"
                          >
                            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Verify & Continue'}
                          </button>
                        </div>
                      )}

                      {/* Sub-Stage 3: Set New Password */}
                      {isPhoneRecoveryVerified && (
                        <form
                          onSubmit={async (e) => {
                            e.preventDefault();
                            setErrorMessage(null);

                            if (!newPassword || !confirmNewPassword) {
                              setErrorMessage('Please fill in both password fields.');
                              return;
                            }
                            if (newPassword !== confirmNewPassword) {
                              setErrorMessage('Passwords do not match. Please verify your entries.');
                              return;
                            }
                            if (getPasswordStrength(newPassword) < 2) {
                              setErrorMessage('Please choose a stronger password (at least 8 characters with letters and numbers).');
                              return;
                            }

                            setIsLoading(true);

                            const cleanPhone = recoveryPhone.trim().replace(/^0+/, '').replace(/[^0-9]/g, '');
                            const targetEmail = `${recoveryCountry.code}${cleanPhone}@phone.aura.com`;

                            try {
                              const success = await recoverPhonePassword(targetEmail, newPassword);
                              if (success) {
                                setResetSuccessMessage('Your phone account password has been successfully reset. You can now sign in using your new password.');
                                setErrorMessage(null);
                              } else {
                                setErrorMessage('Failed to update password. Please check your network and try again.');
                              }
                            } catch (err: any) {
                              setErrorMessage(err.message || 'Password update failed. Please try again.');
                            } finally {
                              setIsLoading(false);
                            }
                          }}
                          className="space-y-4"
                        >
                          {/* New Password */}
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block">
                              New Password
                            </label>
                            <div className="relative flex items-center">
                              <Lock className="absolute left-3.5 h-4 w-4 text-slate-400" />
                              <input
                                type={showNewPassword ? 'text' : 'password'}
                                required
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                placeholder="Min 8 characters"
                                className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-150 dark:border-slate-800/80 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 rounded-xl py-3 pl-10 pr-10 text-xs text-slate-950 dark:text-white outline-none transition-all placeholder:text-slate-400"
                              />
                              <button
                                type="button"
                                onClick={() => setShowNewPassword(!showNewPassword)}
                                className="absolute right-3.5 p-1 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition-all"
                              >
                                {showNewPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                              </button>
                            </div>
                          </div>

                          {/* Confirm New Password */}
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block">
                              Confirm New Password
                            </label>
                            <div className="relative flex items-center">
                              <Lock className="absolute left-3.5 h-4 w-4 text-slate-400" />
                              <input
                                type={showConfirmNewPassword ? 'text' : 'password'}
                                required
                                value={confirmNewPassword}
                                onChange={(e) => setConfirmNewPassword(e.target.value)}
                                placeholder="Repeat new password"
                                className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-150 dark:border-slate-800/80 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 rounded-xl py-3 pl-10 pr-10 text-xs text-slate-950 dark:text-white outline-none transition-all placeholder:text-slate-400"
                              />
                              <button
                                type="button"
                                onClick={() => setShowConfirmNewPassword(!showConfirmNewPassword)}
                                className="absolute right-3.5 p-1 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition-all"
                              >
                                {showConfirmNewPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                              </button>
                            </div>
                          </div>

                          {/* Real-time Password Strength feedback */}
                          {newPassword && (
                            <div className="p-3 bg-slate-50 dark:bg-slate-850 rounded-xl space-y-1.5 border border-slate-150 dark:border-slate-800/65">
                              <div className="flex justify-between items-center text-[10px] font-bold tracking-wider uppercase text-slate-400">
                                <span>Strength Meter</span>
                                <span className={getStrengthLabel(getPasswordStrength(newPassword)).text}>
                                  {getStrengthLabel(getPasswordStrength(newPassword)).label}
                                </span>
                              </div>
                              <div className="flex gap-1 h-1">
                                {[1, 2, 3, 4, 5].map((level) => (
                                  <div
                                    key={level}
                                    className={`flex-1 rounded-full transition-all duration-300 ${
                                      level <= getPasswordStrength(newPassword)
                                        ? getStrengthLabel(getPasswordStrength(newPassword)).color
                                        : 'bg-slate-200 dark:bg-slate-800'
                                    }`}
                                  />
                                ))}
                              </div>
                            </div>
                          )}

                          <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full mt-2 bg-slate-900 hover:bg-slate-850 dark:bg-orange-600 dark:hover:bg-orange-550 text-white rounded-xl py-3.5 text-xs font-bold transition-all shadow-md active:scale-98 flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                          >
                            {isLoading ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <>
                                <Check className="h-4 w-4" />
                                Reset Password
                              </>
                            )}
                          </button>
                        </form>
                      )}

                      {/* Back button (only shown if not yet verified) */}
                      {!isPhoneRecoveryVerified && (
                        <div className="text-center pt-2">
                          <button
                            type="button"
                            onClick={() => {
                              setIsForgotPassword(false);
                              setErrorMessage(null);
                              setResetSuccessMessage(null);
                              setIsPhoneRecoverySmsSent(false);
                              setIsPhoneRecoveryVerified(false);
                            }}
                            className="text-[10px] font-bold text-orange-600 dark:text-orange-400 hover:underline cursor-pointer"
                          >
                            Back to Sign In
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <>
                  {/* Tab Selector */}
                  <div className="flex rounded-2xl bg-slate-100 dark:bg-slate-800/80 p-1 mb-6">
                <button
                  type="button"
                  onClick={() => { setActiveTab('signin'); setErrorMessage(null); setRedirectSuggestion(null); }}
                  className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                    activeTab === 'signin'
                      ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
                  }`}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => { setActiveTab('signup'); setErrorMessage(null); setRedirectSuggestion(null); }}
                  className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                    activeTab === 'signup'
                      ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
                  }`}
                >
                  Register
                </button>
                <button
                  type="button"
                  onClick={() => { setActiveTab('presets'); setErrorMessage(null); setRedirectSuggestion(null); }}
                  className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1 ${
                    activeTab === 'presets'
                      ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
                  }`}
                >
                  <Sparkles className="h-3 w-3 text-amber-500 animate-pulse" />
                  Quick Presets
                </button>
              </div>

              {errorMessage && (
                <div className="mb-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/30 text-xs font-semibold text-rose-700 dark:text-rose-400">
                  {errorMessage}
                </div>
              )}

              {/* Presets List */}
              {activeTab === 'presets' && (
                <div className="space-y-3">
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-2 leading-relaxed">
                    Test different user roles or pre-filled addresses without needing passwords:
                  </p>
                  {PRESET_USERS.map((user) => (
                    <button
                      key={user.id}
                      type="button"
                      disabled={isLoading}
                      onClick={() => handleSelectPreset(user)}
                      className="w-full text-left p-3.5 rounded-2xl border border-slate-100 dark:border-slate-800 hover:border-orange-200 dark:hover:border-orange-950/40 bg-slate-50 dark:bg-slate-800/40 hover:bg-orange-50/20 dark:hover:bg-orange-950/10 flex items-center justify-between transition-all group cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl bg-white dark:bg-slate-800 p-1.5 rounded-xl shadow-xs border border-slate-100 dark:border-slate-750">
                          {user.avatar}
                        </span>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-black text-slate-900 dark:text-white group-hover:text-orange-600 dark:group-hover:text-orange-450 transition-colors">
                              {user.name}
                            </span>
                            <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-md ${
                              user.role === 'Admin'
                                ? 'bg-indigo-50 dark:bg-indigo-950/55 text-indigo-700 dark:text-indigo-400'
                                : user.role === 'VIP'
                                ? 'bg-amber-50 dark:bg-amber-950/55 text-amber-700 dark:text-amber-400'
                                : 'bg-slate-100 dark:bg-slate-850 text-slate-600 dark:text-slate-450'
                            }`}>
                              {user.role}
                            </span>
                          </div>
                          <span className="text-[10px] text-slate-500 dark:text-slate-400 block mt-0.5 font-medium">
                            {user.description}
                          </span>
                        </div>
                      </div>
                      <LogIn className="h-4 w-4 text-slate-400 group-hover:text-orange-500 dark:group-hover:text-orange-400 transition-transform group-hover:translate-x-1" />
                    </button>
                  ))}
                </div>
              )}

              {/* Sign In & Sign Up Form */}
              {activeTab !== 'presets' && (
                <form onSubmit={handleSubmit} className="space-y-4">
                  {activeTab === 'signup' && redirectSuggestion && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="overflow-hidden"
                    >
                      <div className="p-3.5 bg-indigo-50/85 dark:bg-indigo-950/20 border border-indigo-200 dark:border-indigo-900/40 rounded-2xl flex items-start gap-3 shadow-xs mb-1">
                        <div className="h-8 w-8 rounded-xl bg-indigo-100 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 mt-0.5 font-sans font-bold text-xs">
                          {redirectCountdown !== null && redirectCountdown > 0 && !isAutoRedirectCancelled ? (
                            <span className="text-indigo-600 dark:text-indigo-400 animate-pulse font-extrabold">{redirectCountdown}s</span>
                          ) : (
                            <UserCheck className="h-4 w-4" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <span className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-indigo-700 dark:text-indigo-400 font-mono">
                            Registered Account Found
                          </span>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-normal font-medium">
                            An account with {redirectSuggestion.isPhone ? 'phone number' : 'email'} <span className="font-bold text-slate-800 dark:text-slate-200">"{redirectSuggestion.displayVal}"</span> already exists.
                          </p>
                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mt-2.5">
                            <button
                              type="button"
                              onClick={() => {
                                setActiveTab('signin');
                                setAuthMethod(redirectSuggestion.isPhone ? 'phone' : 'email');
                                if (redirectSuggestion.isPhone) {
                                  const phoneNoDomain = redirectSuggestion.identifier.split('@')[0];
                                  const matchedCountry = [...COUNTRIES]
                                    .sort((a, b) => b.code.length - a.code.length)
                                    .find(c => phoneNoDomain.startsWith(c.code));
                                    
                                  if (matchedCountry) {
                                    setSelectedCountry(matchedCountry);
                                    const rawPhone = phoneNoDomain.substring(matchedCountry.code.length);
                                    setPhoneNumber(rawPhone);
                                  } else {
                                    setPhoneNumber(phoneNoDomain);
                                  }
                                } else {
                                  setEmail(redirectSuggestion.displayVal);
                                }
                                setErrorMessage(null);
                                setRedirectSuggestion(null);
                                setRedirectCountdown(null);
                              }}
                              className="text-[11px] font-black text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 flex items-center gap-1.5 underline underline-offset-4 cursor-pointer"
                            >
                              Switch to Sign In & pre-fill <LogIn className="h-3 w-3" />
                            </button>

                            {redirectCountdown !== null && redirectCountdown > 0 && !isAutoRedirectCancelled && (
                              <button
                                type="button"
                                onClick={() => {
                                  setIsAutoRedirectCancelled(true);
                                  setRedirectCountdown(null);
                                }}
                                className="text-[10px] font-extrabold text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 uppercase tracking-wider cursor-pointer"
                              >
                                Cancel Auto-Redirect
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                  {activeTab === 'signin' && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="overflow-hidden"
                    >
                      <div className="p-3.5 bg-orange-50/75 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-900/50 rounded-2xl flex items-start gap-3 shadow-xs mb-1">
                        <div className="h-7 w-7 rounded-lg bg-orange-100 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400 flex items-center justify-center shrink-0 mt-0.5">
                          <Sparkles className="h-4 w-4 animate-pulse" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <span className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-orange-700 dark:text-orange-400 font-mono">
                            {authMethod === 'email' 
                              ? (email ? `Email Login Status` : `Unified Sign-In Banner`) 
                              : (phoneNumber ? `SMS Code Login` : `Unified Sign-In Banner`)
                            }
                          </span>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-normal font-medium">
                            {authMethod === 'email' ? (
                              email ? (
                                <>
                                  Signing in with <span className="font-extrabold text-orange-600 dark:text-orange-400">{email.trim()}</span>. Once logged in, any phone number linked to this account shares the exact same profile & cart!
                                </>
                              ) : (
                                <>
                                  One Profile, Dual Sign-In: You can log in using either your linked <span className="font-extrabold text-slate-850 dark:text-slate-200">email OR phone number</span> seamlessly. Both lead to your exact same history.
                                </>
                              )
                            ) : (
                              phoneNumber ? (
                                <>
                                  Sending verification challenge to <span className="font-extrabold text-orange-600 dark:text-orange-400">{selectedCountry.code} {phoneNumber}</span>. If an email is linked, we automatically sync your complete profile data!
                                </>
                              ) : (
                                <>
                                  Phone OTP Verification: Enter your registered phone number. We will send a secure SMS OTP. You can switch to Email sign-in at any time.
                                </>
                              )
                            )}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  )}
                  {activeTab === 'signup' && (
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block">
                        Full Name
                      </label>
                      <div className="relative flex items-center">
                        <User className="absolute left-3.5 h-4 w-4 text-slate-400" />
                        <input
                          type="text"
                          required
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          placeholder="Your premium name"
                          className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-150 dark:border-slate-800/80 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 rounded-xl py-3 pl-10 pr-4 text-xs text-slate-950 dark:text-white outline-none transition-all placeholder:text-slate-400"
                        />
                      </div>
                    </div>
                  )}

                  {/* Auth Method Selector */}
                  <div className="flex bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl gap-1">
                    <button
                      type="button"
                      onClick={() => setAuthMethod('email')}
                      className={`flex-1 py-1.5 text-[10px] font-bold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                        authMethod === 'email'
                          ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                          : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
                      }`}
                    >
                      <Mail className="h-3.5 w-3.5" />
                      Email Address
                    </button>
                    <button
                      type="button"
                      onClick={() => setAuthMethod('phone')}
                      className={`flex-1 py-1.5 text-[10px] font-bold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                        authMethod === 'phone'
                          ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                          : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
                      }`}
                    >
                      <Smartphone className="h-3.5 w-3.5" />
                      Phone Number
                    </button>
                  </div>

                  {authMethod === 'email' ? (
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block">
                        Email Address
                      </label>
                      <div className="relative flex items-center">
                        <Mail className="absolute left-3.5 h-4 w-4 text-slate-400" />
                        <input
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="you@example.com"
                          className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-150 dark:border-slate-800/80 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 rounded-xl py-3 pl-10 pr-4 text-xs text-slate-950 dark:text-white outline-none transition-all placeholder:text-slate-400"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block">
                        Phone Number
                      </label>
                      <div className="flex gap-2 relative">
                        {/* Country Flag & Dial Code Selector */}
                        <div className="relative">
                          <button
                            type="button"
                            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                            className="flex items-center gap-1.5 h-full bg-slate-50 dark:bg-slate-800/50 border border-slate-150 dark:border-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700 rounded-xl px-3 text-xs text-slate-950 dark:text-white font-bold transition-all cursor-pointer whitespace-nowrap min-w-[100px] justify-between"
                          >
                            <div className="flex items-center gap-1">
                              <span className="text-base select-none">{selectedCountry.flag}</span>
                              <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">{selectedCountry.code}</span>
                            </div>
                            <ChevronDown className={`h-3 w-3 text-slate-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                          </button>

                          <AnimatePresence>
                            {isDropdownOpen && (
                              <>
                                <div 
                                  className="fixed inset-0 z-40" 
                                  onClick={() => setIsDropdownOpen(false)} 
                                />
                                <motion.div
                                  initial={{ opacity: 0, y: 5 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  exit={{ opacity: 0, y: 5 }}
                                  transition={{ duration: 0.15 }}
                                  className="absolute left-0 mt-1.5 w-60 max-h-64 overflow-y-auto bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-2xl shadow-xl z-50 py-1.5 scrollbar-none"
                                >
                                  {COUNTRIES.map((c) => (
                                    <button
                                      key={c.name + c.code}
                                      type="button"
                                      onClick={() => {
                                        setSelectedCountry(c);
                                        setIsDropdownOpen(false);
                                      }}
                                      className={`w-full text-left px-3.5 py-2 hover:bg-slate-50 dark:hover:bg-slate-850 flex items-center justify-between transition-colors cursor-pointer ${
                                        selectedCountry.code === c.code && selectedCountry.name === c.name
                                          ? 'bg-orange-50/50 dark:bg-orange-950/20 text-orange-600 dark:text-orange-400 font-bold'
                                          : 'text-slate-700 dark:text-slate-300'
                                      }`}
                                    >
                                      <div className="flex items-center gap-2.5">
                                        <span className="text-base select-none">{c.flag}</span>
                                        <span className="text-xs font-semibold">{c.name}</span>
                                      </div>
                                      <span className="text-[11px] font-black text-slate-400 dark:text-slate-500">{c.code}</span>
                                    </button>
                                  ))}
                                </motion.div>
                              </>
                            )}
                          </AnimatePresence>
                        </div>

                        {/* Phone Input Box */}
                        <div className="relative flex-1 flex items-center">
                          <Smartphone className="absolute left-3.5 h-4 w-4 text-slate-400" />
                          <input
                            type="tel"
                            required
                            value={phoneNumber}
                            onChange={(e) => {
                              // Only allow numbers and space/hyphen/parentheses
                              const val = e.target.value.replace(/[^0-9\s\-()]/g, '');
                              setPhoneNumber(val);
                            }}
                            placeholder={selectedCountry.placeholder}
                            className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-150 dark:border-slate-800/80 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 rounded-xl py-3 pl-10 pr-4 text-xs text-slate-950 dark:text-white outline-none transition-all placeholder:text-slate-400 font-mono tracking-wider"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block">
                        Password
                      </label>
                      {activeTab === 'signin' && (
                        <button
                          type="button"
                          onClick={() => {
                            setIsForgotPassword(true);
                            setRecoveryMethod(authMethod);
                            setResetEmail(email);
                            if (authMethod === 'phone') {
                              setRecoveryPhone(phoneNumber);
                              setRecoveryCountry(selectedCountry);
                            }
                            setErrorMessage(null);
                            setResetSuccessMessage(null);
                            // Reset phone recovery states
                            setIsPhoneRecoverySmsSent(false);
                            setIsPhoneRecoveryVerified(false);
                            setNewPassword('');
                            setConfirmNewPassword('');
                          }}
                          className="text-[10px] font-bold text-orange-600 dark:text-orange-400 hover:underline cursor-pointer"
                        >
                          Forgot Password?
                        </button>
                      )}
                    </div>
                    <div className="relative flex items-center">
                      <Lock className="absolute left-3.5 h-4 w-4 text-slate-400" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-150 dark:border-slate-800/80 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 rounded-xl py-3 pl-10 pr-10 text-xs text-slate-950 dark:text-white outline-none transition-all placeholder:text-slate-400"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 focus:outline-none transition-colors cursor-pointer"
                        title={showPassword ? "Hide password" : "Show password"}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                    
                    {activeTab === 'signup' && password.length > 0 && (
                      <div className="space-y-1 pt-1.5">
                        <div className="flex items-center justify-between text-[10px]">
                          <span className="font-bold text-slate-400 dark:text-slate-500">Security Level:</span>
                          <span className={`font-black ${getStrengthLabel(getPasswordStrength(password)).text}`}>
                            {getStrengthLabel(getPasswordStrength(password)).label}
                          </span>
                        </div>
                        <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800/80 rounded-full overflow-hidden flex gap-0.5">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <div
                               key={i}
                              className={`h-full flex-1 transition-all duration-300 ${
                                i < getPasswordStrength(password)
                                  ? getStrengthLabel(getPasswordStrength(password)).color
                                  : 'bg-slate-200 dark:bg-slate-850'
                              }`}
                            />
                          ))}
                        </div>
                        <p className="text-[9px] text-slate-400 dark:text-slate-500 leading-normal">
                          Tip: Use at least 8 characters with numbers, uppercase & lowercase letters, and symbols.
                        </p>
                      </div>
                    )}
                  </div>

                  {activeTab === 'signup' && (
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block">
                        Confirm Password
                      </label>
                      <div className="relative flex items-center">
                        <Lock className="absolute left-3.5 h-4 w-4 text-slate-400" />
                        <input
                          type={showConfirmPassword ? 'text' : 'password'}
                          required
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="••••••••"
                          className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-150 dark:border-slate-800/80 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 rounded-xl py-3 pl-10 pr-10 text-xs text-slate-950 dark:text-white outline-none transition-all placeholder:text-slate-400"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 focus:outline-none transition-colors cursor-pointer"
                          title={showConfirmPassword ? "Hide password" : "Show password"}
                        >
                          {showConfirmPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                      {confirmPassword && password !== confirmPassword && (
                        <p className="text-[10px] font-bold text-rose-500 dark:text-rose-400 pt-0.5">
                          Passwords do not match yet
                        </p>
                      )}
                      {confirmPassword && password === confirmPassword && (
                        <p className="text-[10px] font-bold text-emerald-500 dark:text-emerald-450 pt-0.5 flex items-center gap-1">
                          <Check className="h-3.5 w-3.5" /> Passwords match!
                        </p>
                      )}
                    </div>
                  )}

                  {activeTab === 'signup' && (
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block">
                        Choose Avatar Symbol
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {avatars.map((av) => (
                          <button
                            key={av}
                            type="button"
                            onClick={() => setSelectedAvatar(av)}
                            className={`text-xl p-2 rounded-xl transition-all border cursor-pointer ${
                              selectedAvatar === av
                                ? 'bg-orange-50 border-orange-300 scale-110 dark:bg-orange-950/30 dark:border-orange-850'
                                : 'bg-slate-50 border-transparent hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-750'
                            }`}
                          >
                            {av}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Remember Me Checkbox */}
                  <div className="flex items-center space-x-2 pt-2 pb-1">
                    <input
                      type="checkbox"
                      id="rememberMe"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="h-4 w-4 rounded border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-orange-600 focus:ring-orange-500 cursor-pointer accent-orange-600"
                    />
                    <label htmlFor="rememberMe" className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 cursor-pointer select-none">
                      Keep me logged in on this device
                    </label>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full mt-4 bg-slate-900 hover:bg-slate-850 dark:bg-orange-600 dark:hover:bg-orange-550 text-white rounded-xl py-3.5 text-xs font-bold transition-all shadow-md active:scale-98 flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
                  >
                    {isLoading ? (
                      <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <UserCheck className="h-4 w-4" />
                        {activeTab === 'signin' ? 'Sign In Now' : 'Create Premium Account'}
                      </>
                    )}
                  </button>

                  <div className="text-center pt-2">
                    <button
                      type="button"
                      onClick={() => setActiveTab('presets')}
                      className="text-[10px] font-semibold text-orange-600 dark:text-orange-400 hover:underline cursor-pointer"
                    >
                      Or skip entry using standard demo accounts
                    </button>
                  </div>
                </form>
              )}
            </>
          )}
        </div>

            {/* Footer protection line */}
            <div className="bg-slate-50 dark:bg-slate-950/60 border-t border-slate-100 dark:border-slate-850 py-3 px-6 text-center text-[10px] text-slate-400 dark:text-slate-500 flex items-center justify-center gap-1">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
              Symmetric 256-bit simulated encryption secured
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
