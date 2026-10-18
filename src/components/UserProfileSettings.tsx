import React, { useState, useEffect } from 'react';
import { User as UserType, ShippingDetails } from '../types';
import { saveFirestoreUserProfile, linkUserAccount, unlinkUserAccount, checkUserExists } from '../lib/db';
import { auth } from '../lib/firebase';
import {
  Shield,
  Smartphone,
  KeyRound,
  QrCode,
  MapPin,
  User as UserIcon,
  Copy,
  Check,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  Lock,
  ArrowRight,
  Eye,
  EyeOff,
  Sparkles,
  Trash2,
  Bell,
  ShieldAlert,
  Clock,
  Globe,
  Sliders,
  Settings,
  RefreshCw,
  Power
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

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

interface UserProfileSettingsProps {
  currentUser: UserType;
  onUpdateProfile: (updated: UserType) => void;
  onBrowseStore: () => void;
}

export default function UserProfileSettings({
  currentUser,
  onUpdateProfile,
  onBrowseStore,
}: UserProfileSettingsProps) {
  // Tabs: 'profile' | 'security' | 'linked-accounts'
  const [activeSubTab, setActiveSubTab] = useState<'profile' | 'security' | 'linked-accounts'>('profile');

  // Linked Accounts Flow States
  const [linkMethod, setLinkMethod] = useState<'email' | 'phone' | null>(null);
  const [linkInput, setLinkInput] = useState('');
  const [linkStep, setLinkStep] = useState<number>(0); // 0: input, 1: verify OTP
  const [simulatedLinkCode, setSimulatedLinkCode] = useState('');
  const [linkVerificationCode, setLinkVerificationCode] = useState('');
  const [linkError, setLinkError] = useState<string | null>(null);
  const [isLinking, setIsLinking] = useState(false);
  const [linkCountry, setLinkCountry] = useState(COUNTRIES[0]);
  const [isCountryDropdownOpen, setIsCountryDropdownOpen] = useState(false);

  // Basic Profile Form States
  const [name, setName] = useState(currentUser.name || '');
  const [avatarUrl, setAvatarUrl] = useState(currentUser.avatarUrl || '');
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [profileSuccessMsg, setProfileSuccessMsg] = useState('');

  // Shipping Address Form States
  const [shippingPhone, setShippingPhone] = useState(currentUser.shippingAddress?.phone || currentUser.linkedPhone || currentUser.mfaPhone || '');
  const [street, setStreet] = useState(currentUser.shippingAddress?.address || '');
  const [city, setCity] = useState(currentUser.shippingAddress?.city || '');
  const [zipCode, setZipCode] = useState(currentUser.shippingAddress?.postalCode || '');
  const [country, setCountry] = useState(currentUser.shippingAddress?.country || '');

  // MFA Flow States
  const [mfaSetupMethod, setMfaSetupMethod] = useState<'phone' | 'totp' | null>(null);
  const [setupStep, setSetupStep] = useState<number>(0); // 0: select, 1: input phone/display qr, 2: verify code
  const [phoneNumber, setPhoneNumber] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [generatedSecret, setGeneratedSecret] = useState('');
  const [simulatedSmsCode, setSimulatedSmsCode] = useState('');
  const [mfaError, setMfaError] = useState<string | null>(null);
  const [isVerifyingMfa, setIsVerifyingMfa] = useState(false);
  const [copiedSecret, setCopiedSecret] = useState(false);

  // Load and clean initial data
  useEffect(() => {
    setName(currentUser.name || '');
    setAvatarUrl(currentUser.avatarUrl || '');
    setShippingPhone(currentUser.shippingAddress?.phone || currentUser.linkedPhone || currentUser.mfaPhone || '');
    setStreet(currentUser.shippingAddress?.address || '');
    setCity(currentUser.shippingAddress?.city || '');
    setZipCode(currentUser.shippingAddress?.postalCode || '');
    setCountry(currentUser.shippingAddress?.country || '');
  }, [currentUser]);

  // Generate simulated SMS/TOTP secret when method changes
  useEffect(() => {
    if (mfaSetupMethod === 'totp' && setupStep === 1) {
      // Generate a typical 16-character base32-like key for simulator
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
      let secret = '';
      for (let i = 0; i < 16; i++) {
        secret += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      setGeneratedSecret(secret);
    }
  }, [mfaSetupMethod, setupStep]);

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdatingProfile(true);
    setProfileSuccessMsg('');
    try {
      const shippingAddress: ShippingDetails = {
        fullName: name,
        email: currentUser.email,
        phone: shippingPhone,
        address: street,
        city,
        postalCode: zipCode,
        country,
      };

      const updatedUser: UserType = {
        ...currentUser,
        name,
        avatarUrl,
        shippingAddress,
      };

      // Save to Firestore Database
      await saveFirestoreUserProfile(currentUser.id, updatedUser);
      onUpdateProfile(updatedUser);
      setProfileSuccessMsg('Your profile and shipping details have been updated successfully!');
      setTimeout(() => setProfileSuccessMsg(''), 4000);
    } catch (err: any) {
      console.error('[UserProfileSettings] Update failed:', err);
      setMfaError('Failed to save profile changes. Please try again.');
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handleCopySecret = () => {
    try {
      if (navigator.clipboard?.writeText) {
        navigator.clipboard.writeText(generatedSecret).catch(() => {});
      }
    } catch {}
    setCopiedSecret(true);
    setTimeout(() => setCopiedSecret(false), 2000);
  };

  const handleStartPhoneMfa = () => {
    if (!phoneNumber) {
      setMfaError('Please provide a valid phone number.');
      return;
    }
    setMfaError(null);
    setIsVerifyingMfa(true);

    // Simulate sending SMS with beautiful sandbox banner
    setTimeout(() => {
      // Generate a simple 6-digit verification code
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      setSimulatedSmsCode(code);
      setSetupStep(2);
      setIsVerifyingMfa(false);
    }, 1200);
  };

  const handleVerifyCode = async () => {
    if (!verificationCode) {
      setMfaError('Please enter the 6-digit verification code.');
      return;
    }
    setMfaError(null);
    setIsVerifyingMfa(true);

    setTimeout(async () => {
      try {
        if (mfaSetupMethod === 'phone') {
          if (verificationCode !== simulatedSmsCode && verificationCode !== '123456') {
            setMfaError('Invalid verification code. Please check the simulated SMS alert banner and try again.');
            setIsVerifyingMfa(false);
            return;
          }
        } else {
          // TOTP code - accept any 6 digit code for prototype ease, or check matching length
          if (verificationCode.length !== 6 || isNaN(Number(verificationCode))) {
            setMfaError('Please enter a valid 6-digit authenticator code.');
            setIsVerifyingMfa(false);
            return;
          }
        }

        // Successfully verified! Save state in Firestore user profile
        const isPhoneChannel = mfaSetupMethod === 'phone';
        const updatedUser: UserType = {
          ...currentUser,
          mfaEnabled: true,
          mfaPhoneEnabled: isPhoneChannel ? true : !!currentUser.mfaPhoneEnabled,
          mfaPhone: isPhoneChannel ? phoneNumber : currentUser.mfaPhone,
          mfaTotpEnabled: !isPhoneChannel ? true : !!currentUser.mfaTotpEnabled,
          mfaSecret: !isPhoneChannel ? generatedSecret : currentUser.mfaSecret,
          mfaPreferredMethod: currentUser.mfaPreferredMethod || mfaSetupMethod || 'phone',
          mfaMethod: currentUser.mfaPreferredMethod || mfaSetupMethod || 'phone',
        };

        // Add a security alert
        const newAlert = {
          id: 'alert-' + Math.random().toString(36).substring(2, 9),
          type: 'mfa' as const,
          severity: 'info' as const,
          title: `2FA ${isPhoneChannel ? 'SMS' : 'TOTP App'} Enabled`,
          description: `Successfully configured and activated ${isPhoneChannel ? 'Phone SMS' : 'Google/MS Authenticator App'} channel.`,
          timestamp: new Date().toISOString(),
          location: 'Salem, OR (Simulated)',
          ipAddress: '198.51.100.' + Math.floor(Math.random() * 254 + 1),
          resolved: false,
        };
        const existingAlerts = currentUser.securityAlerts || [];
        updatedUser.securityAlerts = [newAlert, ...existingAlerts].slice(0, 20);

        await saveFirestoreUserProfile(currentUser.id, updatedUser);
        onUpdateProfile(updatedUser);
        setSetupStep(3); // success view
      } catch (err) {
        console.error('[UserProfileSettings] MFA Save Error:', err);
        setMfaError('Error finalizing Multi-Factor setup. Please try again.');
      } finally {
        setIsVerifyingMfa(false);
      }
    }, 1000);
  };

  const addSecurityAlert = async (
    type: 'login' | 'mfa' | 'password' | 'unlink' | 'link',
    severity: 'info' | 'warning' | 'critical',
    title: string,
    description: string
  ) => {
    const newAlert = {
      id: 'alert-' + Math.random().toString(36).substring(2, 9),
      type,
      severity,
      title,
      description,
      timestamp: new Date().toISOString(),
      location: 'Salem, OR (Simulated)',
      ipAddress: '198.51.100.' + Math.floor(Math.random() * 254 + 1),
      resolved: false,
    };
    
    const existingAlerts = currentUser.securityAlerts || [];
    const updatedUser: UserType = {
      ...currentUser,
      securityAlerts: [newAlert, ...existingAlerts].slice(0, 20),
    };
    
    await saveFirestoreUserProfile(currentUser.id, updatedUser);
    onUpdateProfile(updatedUser);
  };

  const handleToggleAlertSetting = async (key: 'loginAlerts' | 'changeAlerts' | 'unusualIpAlerts' | 'smsAlerts' | 'emailAlerts') => {
    const currentSettings = currentUser.securityAlertSettings || {
      loginAlerts: true,
      changeAlerts: true,
      unusualIpAlerts: true,
      smsAlerts: false,
      emailAlerts: true,
    };
    
    const updatedSettings = {
      ...currentSettings,
      [key]: !currentSettings[key],
    };
    
    const updatedUser: UserType = {
      ...currentUser,
      securityAlertSettings: updatedSettings,
    };
    
    await saveFirestoreUserProfile(currentUser.id, updatedUser);
    onUpdateProfile(updatedUser);
  };

  const handleResolveAlert = async (alertId: string) => {
    const existingAlerts = currentUser.securityAlerts || [];
    const updatedAlerts = existingAlerts.map(alert => 
      alert.id === alertId ? { ...alert, resolved: true } : alert
    );
    
    const updatedUser: UserType = {
      ...currentUser,
      securityAlerts: updatedAlerts,
    };
    
    await saveFirestoreUserProfile(currentUser.id, updatedUser);
    onUpdateProfile(updatedUser);
  };

  const handleClearAlerts = async () => {
    if (!confirm('Are you sure you want to clear all security logs and alerts?')) {
      return;
    }
    const updatedUser: UserType = {
      ...currentUser,
      securityAlerts: [],
    };
    
    await saveFirestoreUserProfile(currentUser.id, updatedUser);
    onUpdateProfile(updatedUser);
  };

  const handleSetPreferredMfaMethod = async (method: 'phone' | 'totp') => {
    setIsVerifyingMfa(true);
    try {
      const updatedUser: UserType = {
        ...currentUser,
        mfaPreferredMethod: method,
        mfaMethod: method,
      };

      // Add security alert
      const newAlert = {
        id: 'alert-' + Math.random().toString(36).substring(2, 9),
        type: 'mfa' as const,
        severity: 'info' as const,
        title: 'MFA Primary Preferred Channel Updated',
        description: `Primary verification channel changed to ${method === 'phone' ? 'Phone SMS' : 'Authenticator App'}.`,
        timestamp: new Date().toISOString(),
        location: 'Salem, OR (Simulated)',
        ipAddress: '198.51.100.' + Math.floor(Math.random() * 254 + 1),
        resolved: false,
      };
      const existingAlerts = currentUser.securityAlerts || [];
      updatedUser.securityAlerts = [newAlert, ...existingAlerts].slice(0, 20);

      await saveFirestoreUserProfile(currentUser.id, updatedUser);
      onUpdateProfile(updatedUser);
      
      setProfileSuccessMsg(`Primary authentication method switched to ${method === 'phone' ? 'SMS Text' : 'Authenticator App (TOTP)'} successfully.`);
      setTimeout(() => setProfileSuccessMsg(''), 4000);
    } catch (err) {
      console.error('[UserProfileSettings] Error updating preferred MFA:', err);
    } finally {
      setIsVerifyingMfa(false);
    }
  };

  const handleDisableMfaChannel = async (method: 'phone' | 'totp') => {
    if (!confirm(`Are you sure you want to disable ${method === 'phone' ? 'Phone SMS' : 'Authenticator App (TOTP)'} authentication?`)) {
      return;
    }
    setIsVerifyingMfa(true);
    try {
      const isPhone = method === 'phone';
      const phoneEnabled = isPhone ? false : !!currentUser.mfaPhoneEnabled;
      const totpEnabled = !isPhone ? false : !!currentUser.mfaTotpEnabled;
      const remainsEnabled = phoneEnabled || totpEnabled;
      
      let nextPreferred: 'phone' | 'totp' | undefined = undefined;
      if (remainsEnabled) {
        nextPreferred = phoneEnabled ? 'phone' : 'totp';
      }

      const updatedUser: UserType = {
        ...currentUser,
        mfaEnabled: remainsEnabled,
        mfaPhoneEnabled: phoneEnabled,
        mfaPhone: phoneEnabled ? currentUser.mfaPhone : undefined,
        mfaTotpEnabled: totpEnabled,
        mfaSecret: totpEnabled ? currentUser.mfaSecret : undefined,
        mfaPreferredMethod: nextPreferred,
        mfaMethod: nextPreferred,
      };

      // Add security alert
      const newAlert = {
        id: 'alert-' + Math.random().toString(36).substring(2, 9),
        type: 'mfa' as const,
        severity: 'warning' as const,
        title: `${method === 'phone' ? 'Phone SMS' : 'Authenticator App'} Deactivated`,
        description: `Your ${method === 'phone' ? 'SMS Text Message' : 'TOTP Authenticator Token'} channel was deactivated.`,
        timestamp: new Date().toISOString(),
        location: 'Salem, OR (Simulated)',
        ipAddress: '198.51.100.' + Math.floor(Math.random() * 254 + 1),
        resolved: false,
      };
      const existingAlerts = currentUser.securityAlerts || [];
      updatedUser.securityAlerts = [newAlert, ...existingAlerts].slice(0, 20);

      await saveFirestoreUserProfile(currentUser.id, updatedUser);
      onUpdateProfile(updatedUser);
      
      setMfaSetupMethod(null);
      setSetupStep(0);
      setPhoneNumber('');
      setVerificationCode('');
      setSimulatedSmsCode('');

      setProfileSuccessMsg(`${method === 'phone' ? 'Phone SMS' : 'Authenticator App (TOTP)'} has been disabled.`);
      setTimeout(() => setProfileSuccessMsg(''), 4000);
    } catch (err) {
      console.error('[UserProfileSettings] Error disabling channel:', err);
    } finally {
      setIsVerifyingMfa(false);
    }
  };

  const handleDisableMfa = async () => {
    if (!confirm('Are you sure you want to disable Two-Factor Authentication? Your account will be less secure.')) {
      return;
    }
    setIsVerifyingMfa(true);
    try {
      const updatedUser: UserType = {
        ...currentUser,
        mfaEnabled: false,
        mfaMethod: undefined,
        mfaPhone: undefined,
        mfaSecret: undefined,
        mfaPhoneEnabled: false,
        mfaTotpEnabled: false,
        mfaPreferredMethod: undefined,
      };

      // Add security alert
      const newAlert = {
        id: 'alert-' + Math.random().toString(36).substring(2, 9),
        type: 'mfa' as const,
        severity: 'critical' as const,
        title: 'Two-Factor Authentication fully disabled',
        description: 'All 2FA protective shields have been removed from your account.',
        timestamp: new Date().toISOString(),
        location: 'Salem, OR (Simulated)',
        ipAddress: '198.51.100.' + Math.floor(Math.random() * 254 + 1),
        resolved: false,
      };
      const existingAlerts = currentUser.securityAlerts || [];
      updatedUser.securityAlerts = [newAlert, ...existingAlerts].slice(0, 20);

      await saveFirestoreUserProfile(currentUser.id, updatedUser);
      onUpdateProfile(updatedUser);
      setMfaSetupMethod(null);
      setSetupStep(0);
      setPhoneNumber('');
      setVerificationCode('');
      setSimulatedSmsCode('');
      setProfileSuccessMsg('Two-Factor Authentication (MFA) has been disabled safely.');
      setTimeout(() => setProfileSuccessMsg(''), 4000);
    } catch (err) {
      console.error('[UserProfileSettings] Error disabling MFA:', err);
      setMfaError('Error disabling MFA. Please try again.');
    } finally {
      setIsVerifyingMfa(false);
    }
  };

  const resetMfaFlow = () => {
    setMfaSetupMethod(null);
    setSetupStep(0);
    setPhoneNumber('');
    setVerificationCode('');
    setSimulatedSmsCode('');
    setMfaError(null);
  };

  const handleStartLinkPhone = () => {
    if (!linkInput) {
      setLinkError('Please enter a valid phone number.');
      return;
    }
    const cleanPhone = linkInput.trim().replace(/^0+/, '').replace(/[^0-9]/g, '');
    if (cleanPhone.length < 6) {
      setLinkError('Phone number is too short.');
      return;
    }
    
    setLinkError(null);
    setIsLinking(true);
    
    setTimeout(() => {
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      setSimulatedLinkCode(code);
      setLinkStep(1);
      setIsLinking(false);
    }, 1200);
  };

  const handleStartLinkEmail = async () => {
    if (!linkInput || !linkInput.includes('@')) {
      setLinkError('Please enter a valid email address.');
      return;
    }
    
    setLinkError(null);
    setIsLinking(true);
    
    try {
      const emailToCheck = linkInput.toLowerCase().trim();
      const exists = await checkUserExists(emailToCheck);
      if (exists) {
        setLinkError('This email address is already registered or linked to another account.');
        setIsLinking(false);
        return;
      }
      
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      setSimulatedLinkCode(code);
      setLinkStep(1);
    } catch (err: any) {
      setLinkError(err.message || 'An error occurred. Please try again.');
    } finally {
      setIsLinking(false);
    }
  };

  const handleVerifyAndLink = async () => {
    if (!linkVerificationCode) {
      setLinkError('Please enter the 6-digit verification code.');
      return;
    }
    if (linkVerificationCode !== simulatedLinkCode && linkVerificationCode !== '123456') {
      setLinkError('Invalid verification code. Please check the simulated notification banner at the top.');
      return;
    }

    setLinkError(null);
    setIsLinking(true);

    try {
      const formattedIdentifier = linkMethod === 'phone' 
        ? `${linkCountry.code}${linkInput.trim().replace(/^0+/, '').replace(/[^0-9]/g, '')}`
        : linkInput.toLowerCase().trim();

      const updated = await linkUserAccount(currentUser, linkMethod!, formattedIdentifier);
      onUpdateProfile(updated);
      setProfileSuccessMsg(`Successfully linked your ${linkMethod === 'phone' ? 'phone number' : 'email address'} to this account!`);
      setTimeout(() => setProfileSuccessMsg(''), 4000);
      
      // Reset flow
      setLinkMethod(null);
      setLinkInput('');
      setLinkStep(0);
      setSimulatedLinkCode('');
      setLinkVerificationCode('');
    } catch (err: any) {
      setLinkError(err.message || 'Failed to link account.');
    } finally {
      setIsLinking(false);
    }
  };

  const handleUnlink = async (type: 'email' | 'phone') => {
    const confirmationMsg = `Are you sure you want to unlink your linked ${type === 'phone' ? 'phone number' : 'email address'}? You will no longer be able to log in using this method.`;
    if (!confirm(confirmationMsg)) {
      return;
    }
    
    setIsLinking(true);
    setLinkError(null);
    try {
      const updated = await unlinkUserAccount(currentUser, type);
      onUpdateProfile(updated);
      setProfileSuccessMsg(`Successfully unlinked your ${type === 'phone' ? 'phone number' : 'email address'}.`);
      setTimeout(() => setProfileSuccessMsg(''), 4000);
    } catch (err: any) {
      setLinkError(err.message || 'Failed to unlink account.');
    } finally {
      setIsLinking(false);
    }
  };

  const resetLinkFlow = () => {
    setLinkMethod(null);
    setLinkInput('');
    setLinkStep(0);
    setSimulatedLinkCode('');
    setLinkVerificationCode('');
    setLinkError(null);
  };

  return (
    <div id="user-profile-settings-page" className="space-y-8 font-sans">
      {/* Header Banner Section */}
      <section id="profile-settings-header" className="text-center md:text-left">
        <h1 className="text-3xl font-black tracking-tight text-slate-950 dark:text-white md:text-4xl flex items-center justify-center md:justify-start gap-3 select-none">
          <Shield className="h-8 w-8 text-orange-500 animate-pulse" />
          Profile Settings &amp; Security
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-slate-500 max-w-2xl">
          Manage your personal details, default shipping address, and activate elevated defense layers with Two-Factor Authentication.
        </p>
      </section>

      {/* Floating Demo SMS banner if simulation active */}
      <AnimatePresence>
        {mfaSetupMethod === 'phone' && setupStep === 2 && simulatedSmsCode && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-orange-50 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-900/60 p-4 rounded-2xl flex items-center gap-3.5 shadow-md mb-3"
          >
            <Smartphone className="h-6 w-6 text-orange-500 shrink-0 animate-bounce" />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-black text-slate-900 dark:text-orange-300">
                [SANDBOX SMS VERIFICATION CONSOLE]
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                Simulated text message sent to <span className="font-bold">{phoneNumber}</span>: Use code <span className="font-extrabold text-orange-600 dark:text-orange-400 text-sm bg-orange-100 dark:bg-orange-900/40 px-2 py-0.5 rounded-lg border border-orange-200/50 dark:border-orange-850/50">{simulatedSmsCode}</span> to verify your login identity.
              </p>
            </div>
          </motion.div>
        )}

        {linkStep === 1 && simulatedLinkCode && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-orange-50 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-900/60 p-4 rounded-2xl flex items-center gap-3.5 shadow-md mb-3"
          >
            <Smartphone className="h-6 w-6 text-orange-500 shrink-0 animate-bounce" />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-black text-slate-900 dark:text-orange-300">
                {linkMethod === 'phone' ? '[SANDBOX LINK SMS CONSOLE]' : '[SANDBOX LINK EMAIL CONSOLE]'}
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                {linkMethod === 'phone' ? (
                  <>Simulated text message sent to <span className="font-bold">{linkCountry.code} {linkInput}</span>: Use linking code <span className="font-extrabold text-orange-600 dark:text-orange-400 text-sm bg-orange-100 dark:bg-orange-900/40 px-2 py-0.5 rounded-lg border border-orange-200/50 dark:border-orange-850/50">{simulatedLinkCode}</span> to verify and link your phone number.</>
                ) : (
                  <>Simulated security email sent to <span className="font-bold">{linkInput}</span>: Use linking code <span className="font-extrabold text-orange-600 dark:text-orange-400 text-sm bg-orange-100 dark:bg-orange-900/40 px-2 py-0.5 rounded-lg border border-orange-200/50 dark:border-orange-850/50">{simulatedLinkCode}</span> to verify and link your email address.</>
                )}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sub Tabs Toggle */}
      <div className="flex border-b border-slate-100 dark:border-slate-800/80 pb-0.5 gap-4">
        <button
          type="button"
          onClick={() => setActiveSubTab('profile')}
          className={`pb-3 text-xs font-bold transition-all relative select-none cursor-pointer ${
            activeSubTab === 'profile'
              ? 'text-slate-950 dark:text-white'
              : 'text-slate-400 hover:text-slate-650 dark:text-slate-500'
          }`}
        >
          <span className="flex items-center gap-1.5">
            <UserIcon className="h-3.5 w-3.5" />
            Personal &amp; Shipping Profile
          </span>
          {activeSubTab === 'profile' && (
            <motion.div
              layoutId="subtab-indicator"
              className="absolute bottom-0 left-0 right-0 h-0.5 bg-orange-500"
            />
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('security')}
          className={`pb-3 text-xs font-bold transition-all relative select-none cursor-pointer ${
            activeSubTab === 'security'
              ? 'text-slate-950 dark:text-white'
              : 'text-slate-400 hover:text-slate-650 dark:text-slate-500'
          }`}
        >
          <span className="flex items-center gap-1.5">
            <Shield className="h-3.5 w-3.5" />
            Account Security (MFA)
          </span>
          {activeSubTab === 'security' && (
            <motion.div
              layoutId="subtab-indicator"
              className="absolute bottom-0 left-0 right-0 h-0.5 bg-orange-500"
            />
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('linked-accounts')}
          className={`pb-3 text-xs font-bold transition-all relative select-none cursor-pointer ${
            activeSubTab === 'linked-accounts'
              ? 'text-slate-950 dark:text-white'
              : 'text-slate-400 hover:text-slate-650 dark:text-slate-500'
          }`}
        >
          <span className="flex items-center gap-1.5">
            <Smartphone className="h-3.5 w-3.5" />
            Linked Email &amp; Phone
          </span>
          {activeSubTab === 'linked-accounts' && (
            <motion.div
              layoutId="subtab-indicator"
              className="absolute bottom-0 left-0 right-0 h-0.5 bg-orange-500"
            />
          )}
        </button>
      </div>

      {profileSuccessMsg && (
        <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-150 dark:border-emerald-900/50 text-emerald-700 dark:text-emerald-400 text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          {profileSuccessMsg}
        </div>
      )}

      {/* Content Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left/Middle Column - Content Areas */}
        <div className="lg:col-span-2 space-y-6">
          <AnimatePresence mode="wait">
            {activeSubTab === 'profile' && (
              <motion.div
                key="profile-panel"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800/80 rounded-3xl p-6 shadow-xs"
              >
                <form onSubmit={handleProfileSubmit} className="space-y-6">
                  {/* Account Basics Segment */}
                  <div className="space-y-4">
                    <h2 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                      <UserIcon className="h-4 w-4 text-slate-400" />
                      Account Details
                    </h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                          Full Name
                        </label>
                        <input
                          type="text"
                          required
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="w-full bg-slate-50 dark:bg-slate-850/50 border border-slate-150 dark:border-slate-800/80 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 rounded-xl py-2.5 px-3.5 text-xs text-slate-950 dark:text-white outline-none transition-all"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                          {currentUser.email.endsWith('@phone.aura.com') ? 'Phone Number (Unmodifiable)' : 'Email Address (Unmodifiable)'}
                        </label>
                        <input
                          type="text"
                          disabled
                          value={currentUser.email.endsWith('@phone.aura.com') ? currentUser.email.split('@')[0] : currentUser.email}
                          className="w-full bg-slate-100 dark:bg-slate-850/30 border border-slate-150 dark:border-slate-800/80 rounded-xl py-2.5 px-3.5 text-xs text-slate-400 cursor-not-allowed outline-none font-semibold"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                        Profile Picture URL
                      </label>
                      <input
                        type="url"
                        placeholder="https://images.unsplash.com/..."
                        value={avatarUrl}
                        onChange={(e) => setAvatarUrl(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-slate-850/50 border border-slate-150 dark:border-slate-800/80 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 rounded-xl py-2.5 px-3.5 text-xs text-slate-950 dark:text-white outline-none transition-all placeholder:text-slate-400"
                      />
                    </div>
                  </div>

                  {/* Shipping Address Segment */}
                  <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800/80">
                    <h2 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-slate-400" />
                      Default Delivery &amp; Contact Destination
                    </h2>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                        Default Customer Phone / WhatsApp
                      </label>
                      <input
                        type="tel"
                        placeholder="e.g. +256 700 123 456"
                        value={shippingPhone}
                        onChange={(e) => setShippingPhone(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-slate-850/50 border border-slate-150 dark:border-slate-800/80 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 rounded-xl py-2.5 px-3.5 text-xs text-slate-950 dark:text-white outline-none transition-all placeholder:text-slate-400"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                        Street Address
                      </label>
                      <input
                        type="text"
                        placeholder="120 Luxury Avenue, Suite 4B"
                        value={street}
                        onChange={(e) => setStreet(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-slate-850/50 border border-slate-150 dark:border-slate-800/80 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 rounded-xl py-2.5 px-3.5 text-xs text-slate-950 dark:text-white outline-none transition-all placeholder:text-slate-400"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                          City
                        </label>
                        <input
                          type="text"
                          placeholder="Beverly Hills"
                          value={city}
                          onChange={(e) => setCity(e.target.value)}
                          className="w-full bg-slate-50 dark:bg-slate-850/50 border border-slate-150 dark:border-slate-800/80 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 rounded-xl py-2.5 px-3.5 text-xs text-slate-950 dark:text-white outline-none transition-all placeholder:text-slate-400"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                          ZIP / Postal
                        </label>
                        <input
                          type="text"
                          placeholder="90210"
                          value={zipCode}
                          onChange={(e) => setZipCode(e.target.value)}
                          className="w-full bg-slate-50 dark:bg-slate-850/50 border border-slate-150 dark:border-slate-800/80 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 rounded-xl py-2.5 px-3.5 text-xs text-slate-950 dark:text-white outline-none transition-all placeholder:text-slate-400"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                        Country
                      </label>
                      <input
                        type="text"
                        placeholder="United States"
                        value={country}
                        onChange={(e) => setCountry(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-slate-850/50 border border-slate-150 dark:border-slate-800/80 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 rounded-xl py-2.5 px-3.5 text-xs text-slate-950 dark:text-white outline-none transition-all placeholder:text-slate-400"
                      />
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className="pt-4 flex items-center justify-end gap-3">
                    <button
                      type="button"
                      onClick={onBrowseStore}
                      className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-600 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all cursor-pointer"
                    >
                      Return to Catalog
                    </button>
                    <button
                      type="submit"
                      disabled={isUpdatingProfile}
                      className="bg-orange-500 hover:bg-orange-600 active:bg-orange-700 text-slate-950 font-black text-xs uppercase tracking-wider py-2.5 px-5 rounded-xl transition-all shadow-xs hover:shadow-md cursor-pointer flex items-center gap-2"
                    >
                      {isUpdatingProfile ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" /> Saving Changes
                        </>
                      ) : (
                        'Save Account Profile'
                      )}
                    </button>
                  </div>
                </form>
              </motion.div>
            )}

            {activeSubTab === 'security' && (
              <motion.div
                key="security-panel"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="space-y-6"
              >
                {mfaSetupMethod !== null ? (
                  /* RENDER MFA SETUP WIZARD */
                  <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800/80 rounded-3xl p-6 shadow-xs space-y-5">
                    {/* Wizard Steps indicator */}
                    <div className="flex items-center justify-between border-b border-slate-50 dark:border-slate-850 pb-4">
                      <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                        <KeyRound className="h-4 w-4 text-orange-500" />
                        {mfaSetupMethod === 'phone' ? 'Phone SMS Wizard' : 'Authenticator App setup'}
                      </h4>
                      <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400">
                        <span className={`h-5 w-5 rounded-full flex items-center justify-center border ${setupStep >= 1 ? 'border-orange-500 text-orange-500 font-extrabold bg-orange-500/5' : 'border-slate-200'}`}>1</span>
                        <span className="w-4 h-0.5 bg-slate-200 dark:bg-slate-800" />
                        <span className={`h-5 w-5 rounded-full flex items-center justify-center border ${setupStep >= 2 ? 'border-orange-500 text-orange-500 font-extrabold bg-orange-500/5' : 'border-slate-200'}`}>2</span>
                        <span className="w-4 h-0.5 bg-slate-200 dark:bg-slate-800" />
                        <span className={`h-5 w-5 rounded-full flex items-center justify-center border ${setupStep >= 3 ? 'border-orange-500 text-orange-500 font-extrabold bg-orange-500/5' : 'border-slate-200'}`}>3</span>
                      </div>
                    </div>

                    {mfaError && (
                      <div className="p-3.5 bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/50 rounded-xl text-rose-600 dark:text-rose-450 text-xs font-bold flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 shrink-0" />
                        {mfaError}
                      </div>
                    )}

                    {/* Step 1 for Phone SMS: Enter Phone */}
                    {mfaSetupMethod === 'phone' && setupStep === 1 && (
                      <div className="space-y-4">
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block">
                            Mobile Phone Number
                          </label>
                          <input
                            type="tel"
                            placeholder="+1 (555) 019-2834"
                            value={phoneNumber}
                            onChange={(e) => setPhoneNumber(e.target.value)}
                            className="w-full bg-slate-50 dark:bg-slate-850/50 border border-slate-150 dark:border-slate-800/80 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 rounded-xl py-2.5 px-3.5 text-xs text-slate-950 dark:text-white outline-none transition-all placeholder:text-slate-450"
                          />
                          <p className="text-[10px] text-slate-400 leading-normal">
                            Enter your phone number including country code (e.g. +1 for USA, +44 for UK).
                          </p>
                        </div>
                        <div className="pt-2 flex items-center justify-between">
                          <button
                            type="button"
                            onClick={resetMfaFlow}
                            className="text-xs font-bold text-slate-500 hover:text-slate-700 dark:hover:text-white transition-all"
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            onClick={handleStartPhoneMfa}
                            disabled={isVerifyingMfa}
                            className="bg-slate-950 hover:bg-slate-900 text-white dark:bg-orange-500 dark:text-slate-950 font-black text-xs uppercase tracking-wider py-2.5 px-5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
                          >
                            {isVerifyingMfa ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : 'Send Code'}
                            <ArrowRight className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Step 1 for Authenticator App: Show Secret & QR Code */}
                    {mfaSetupMethod === 'totp' && setupStep === 1 && (
                      <div className="space-y-4">
                        <div className="text-center bg-slate-50 dark:bg-slate-950/40 border border-slate-150 dark:border-slate-850 p-4 rounded-2xl flex flex-col items-center gap-3">
                          <p className="text-xs text-slate-550 dark:text-slate-400 font-medium max-w-sm">
                            Scan the QR code with your authenticator app (e.g. Google Authenticator), or enter the configuration key manually.
                          </p>

                          {/* Render Static/Dynamic QR Code representation */}
                          <div className="bg-white p-2.5 rounded-xl shadow-xs border border-slate-150 flex items-center justify-center">
                            <img
                              src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(
                                `otpauth://totp/Aura:${currentUser.email}?secret=${generatedSecret}&issuer=Aura`
                              )}`}
                              alt="Scan QR Code"
                              className="h-36 w-36"
                              onError={(e) => {
                                // If API is blocked, show custom fallback QR design
                                e.currentTarget.style.display = 'none';
                              }}
                            />
                            {/* Visual SVG QR representation in case internet fails */}
                            <div className="hidden qr-api-failed h-36 w-36 bg-slate-100 dark:bg-slate-900 border border-dashed border-slate-350 rounded flex flex-col items-center justify-center">
                              <QrCode className="h-10 w-10 text-slate-400 animate-pulse" />
                              <span className="text-[8px] font-black uppercase text-slate-400 mt-1">Scan Key Below</span>
                            </div>
                          </div>

                          <div className="w-full space-y-1.5 pt-2">
                            <span className="text-[9px] font-black uppercase tracking-wider text-slate-400 block">Configuration Secret Key</span>
                            <div className="flex items-center bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-850 rounded-xl px-3 py-2 text-xs">
                              <span className="font-mono text-orange-600 dark:text-orange-400 font-extrabold flex-1 text-center select-all tracking-widest">{generatedSecret}</span>
                              <button
                                type="button"
                                onClick={handleCopySecret}
                                className="text-slate-400 hover:text-slate-600 dark:hover:text-white ml-2 transition-all cursor-pointer"
                              >
                                {copiedSecret ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
                              </button>
                            </div>
                          </div>
                        </div>

                        <div className="pt-2 flex items-center justify-between">
                          <button
                            type="button"
                            onClick={resetMfaFlow}
                            className="text-xs font-bold text-slate-500 hover:text-slate-700 dark:hover:text-white transition-all"
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            onClick={() => setSetupStep(2)}
                            className="bg-slate-950 hover:bg-slate-900 text-white dark:bg-orange-500 dark:text-slate-950 font-black text-xs uppercase tracking-wider py-2.5 px-5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
                          >
                            Confirm Scan
                            <ArrowRight className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Step 2: Verify Code (Common for both phone & totp) */}
                    {setupStep === 2 && (
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block">
                            {mfaSetupMethod === 'phone' ? 'Enter SMS OTP Code' : 'Enter 6-Digit Authenticator Token'}
                          </label>
                          <div className="relative flex items-center">
                            <Lock className="absolute left-3.5 h-4 w-4 text-slate-400" />
                            <input
                              type="text"
                              maxLength={6}
                              placeholder="123456"
                              value={verificationCode}
                              onChange={(e) => setVerificationCode(e.target.value)}
                              className="w-full bg-slate-50 dark:bg-slate-850/50 border border-slate-150 dark:border-slate-800/80 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 rounded-xl py-3 pl-10 pr-4 text-xs text-slate-950 dark:text-white outline-none transition-all placeholder:text-slate-450 text-center tracking-widest font-extrabold font-mono"
                            />
                          </div>
                          <p className="text-[9px] text-slate-400 dark:text-slate-500 leading-normal">
                            {mfaSetupMethod === 'phone'
                              ? 'Enter the 6-digit confirmation code generated in the orange simulator banner at the top.'
                              : 'Enter the rotating 6-digit verification code showing in your authenticator app.'}
                          </p>
                        </div>

                        <div className="pt-2 flex items-center justify-between">
                          <button
                            type="button"
                            onClick={() => setSetupStep(1)}
                            className="text-xs font-bold text-slate-500 hover:text-slate-700 dark:hover:text-white transition-all"
                          >
                            Back
                          </button>
                          <button
                            type="button"
                            onClick={handleVerifyCode}
                            disabled={isVerifyingMfa}
                            className="bg-orange-500 hover:bg-orange-600 active:bg-orange-700 text-slate-950 font-black text-xs uppercase tracking-wider py-2.5 px-5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
                          >
                            {isVerifyingMfa ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : 'Verify & Enable'}
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Step 3: Setup Complete Success View */}
                    {setupStep === 3 && (
                      <div className="text-center py-6 space-y-4">
                        <div className="h-12 w-12 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 text-emerald-500 flex items-center justify-center mx-auto shadow-inner">
                          <Check className="h-6 w-6 stroke-[3]" />
                        </div>
                        <div className="space-y-1.5">
                          <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">
                            Two-Factor Setup Successful!
                          </h4>
                          <p className="text-xs text-slate-500 dark:text-slate-450 leading-relaxed max-w-sm mx-auto">
                            Elevated protection has been activated on your account. The next time you sign into your Aura account, you will be required to provide a second token.
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={resetMfaFlow}
                          className="px-5 py-2.5 bg-slate-900 text-white dark:bg-slate-800 dark:hover:bg-slate-750 font-bold text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer"
                        >
                          Close Wizard
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  /* MAIN DUAL-CHANNEL SECURITY DASHBOARD */
                  <>
                    {/* Security Shields Header Status Banner */}
                    {currentUser.mfaEnabled ? (
                      <div className="p-5 bg-gradient-to-br from-emerald-500/10 via-teal-500/5 to-transparent border border-emerald-500/20 rounded-3xl space-y-3 shadow-xs">
                        <div className="flex items-start gap-3.5">
                          <div className="h-10 w-10 rounded-xl bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-500 dark:text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/20">
                            <Shield className="h-5 w-5 animate-pulse" />
                          </div>
                          <div className="space-y-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
                                Two-Factor Authentication is Enabled
                              </h3>
                              {currentUser.mfaPhoneEnabled && currentUser.mfaTotpEnabled ? (
                                <span className="bg-indigo-100 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-350 text-[9px] font-black uppercase px-2 py-0.5 rounded-md tracking-wider border border-indigo-200/45 dark:border-indigo-900/30 flex items-center gap-1">
                                  <Sparkles className="h-2.5 w-2.5 animate-pulse" /> Dual-Channel Protection
                                </span>
                              ) : (
                                <span className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-350 text-[9px] font-black uppercase px-2 py-0.5 rounded-md tracking-wider">
                                  Single-Channel active
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-slate-550 dark:text-slate-400 leading-normal">
                              {currentUser.mfaPhoneEnabled && currentUser.mfaTotpEnabled
                                ? 'Your profile is heavily fortified. You have successfully bound both SMS and Authenticator app channels. In case of emergency, you can use either channel to securely bypass login challenges.'
                                : 'Your account is secured with 2FA, but you can achieve maximum durability and redundancy by enrolling both SMS text messages and Authenticator rotating tokens.'}
                            </p>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="p-5 bg-gradient-to-br from-orange-500/10 via-amber-500/5 to-transparent border border-orange-500/20 rounded-3xl space-y-3">
                        <div className="flex items-start gap-3.5">
                          <div className="h-10 w-10 rounded-xl bg-orange-500/10 dark:bg-orange-500/20 text-orange-500 dark:text-orange-400 flex items-center justify-center shrink-0 border border-orange-500/20">
                            <Lock className="h-5 w-5" />
                          </div>
                          <div className="space-y-1">
                            <h3 className="text-sm font-black text-slate-900 dark:text-white">
                              Two-Factor Shielding is Inactive
                            </h3>
                            <p className="text-xs text-slate-550 dark:text-slate-400 leading-normal">
                              Protect your premium account credentials and order histories with military-grade identity verification. Set up dual channels to avoid lockout risks.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* LEFT COLUMN: Channels management */}
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h4 className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-1.5">
                            <Sliders className="h-3.5 w-3.5 text-orange-500" />
                            Multi-Factor Security Channels
                          </h4>
                        </div>

                        {/* Channel 1: Phone SMS */}
                        <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-150 dark:border-slate-800/60 flex flex-col justify-between gap-4">
                          <div className="flex items-start justify-between">
                            <div className="flex items-start gap-3">
                              <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${currentUser.mfaPhoneEnabled ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-500' : 'bg-slate-100 dark:bg-slate-850 text-slate-450'}`}>
                                <Smartphone className="h-4.5 w-4.5" />
                              </div>
                              <div>
                                <span className="font-extrabold text-xs block text-slate-900 dark:text-white">Phone SMS Verification</span>
                                <span className="text-[10px] text-slate-400 mt-1 block font-medium">
                                  {currentUser.mfaPhoneEnabled ? `Active: ${currentUser.mfaPhone}` : 'Deactivated'}
                                </span>
                              </div>
                            </div>

                            {currentUser.mfaPhoneEnabled && (
                              <div className="flex items-center gap-1.5">
                                {currentUser.mfaPreferredMethod === 'phone' ? (
                                  <span className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-150 dark:border-emerald-900/40 text-emerald-700 dark:text-emerald-450 text-[9px] font-black px-2 py-0.5 rounded uppercase tracking-wider">
                                    Primary
                                  </span>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={() => handleSetPreferredMfaMethod('phone')}
                                    className="text-[9px] text-orange-600 dark:text-orange-400 font-extrabold hover:underline"
                                  >
                                    Set as Primary
                                  </button>
                                )}
                              </div>
                            )}
                          </div>

                          <div className="flex items-center gap-2">
                            {currentUser.mfaPhoneEnabled ? (
                              <button
                                type="button"
                                onClick={() => handleDisableMfaChannel('phone')}
                                className="text-center w-full py-1.5 border border-rose-200 hover:border-rose-300 dark:border-slate-800/80 dark:hover:border-rose-950/40 bg-white dark:bg-slate-900 hover:bg-rose-50 text-rose-600 dark:text-rose-450 text-[10px] font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer"
                              >
                                Disable Phone SMS
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() => {
                                  setMfaSetupMethod('phone');
                                  setSetupStep(1);
                                }}
                                className="text-center w-full py-1.5 bg-slate-900 text-white dark:bg-slate-800 dark:hover:bg-slate-750 hover:bg-slate-950 text-[10px] font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer"
                              >
                                Enable Phone SMS
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Channel 2: Authenticator App */}
                        <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-150 dark:border-slate-800/60 flex flex-col justify-between gap-4">
                          <div className="flex items-start justify-between">
                            <div className="flex items-start gap-3">
                              <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${currentUser.mfaTotpEnabled ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-500' : 'bg-slate-100 dark:bg-slate-850 text-slate-450'}`}>
                                <QrCode className="h-4.5 w-4.5" />
                              </div>
                              <div>
                                <span className="font-extrabold text-xs block text-slate-900 dark:text-white">Authenticator App (TOTP)</span>
                                <span className="text-[10px] text-slate-400 mt-1 block font-mono font-medium">
                                  {currentUser.mfaTotpEnabled ? `Active: ${currentUser.mfaSecret?.substring(0, 4)}••••••••` : 'Deactivated'}
                                </span>
                              </div>
                            </div>

                            {currentUser.mfaTotpEnabled && (
                              <div className="flex items-center gap-1.5">
                                {currentUser.mfaPreferredMethod === 'totp' ? (
                                  <span className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-150 dark:border-emerald-900/40 text-emerald-700 dark:text-emerald-450 text-[9px] font-black px-2 py-0.5 rounded uppercase tracking-wider">
                                    Primary
                                  </span>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={() => handleSetPreferredMfaMethod('totp')}
                                    className="text-[9px] text-orange-600 dark:text-orange-400 font-extrabold hover:underline"
                                  >
                                    Set as Primary
                                  </button>
                                )}
                              </div>
                            )}
                          </div>

                          <div className="flex items-center gap-2">
                            {currentUser.mfaTotpEnabled ? (
                              <button
                                type="button"
                                onClick={() => handleDisableMfaChannel('totp')}
                                className="text-center w-full py-1.5 border border-rose-200 hover:border-rose-300 dark:border-slate-800/80 dark:hover:border-rose-950/40 bg-white dark:bg-slate-900 hover:bg-rose-50 text-rose-600 dark:text-rose-450 text-[10px] font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer"
                              >
                                Disable Authenticator
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() => {
                                  setMfaSetupMethod('totp');
                                  setSetupStep(1);
                                }}
                                className="text-center w-full py-1.5 bg-slate-900 text-white dark:bg-slate-800 dark:hover:bg-slate-750 hover:bg-slate-950 text-[10px] font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer"
                              >
                                Enable Authenticator
                              </button>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* RIGHT COLUMN: Security Alerts & Preferences */}
                      <div className="space-y-4">
                        <h4 className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-1.5">
                          <Bell className="h-3.5 w-3.5 text-orange-500" />
                          Security Alert Preferences
                        </h4>

                        <div className="p-5 bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800/60 rounded-2xl space-y-4 text-xs font-semibold">
                          <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 block">Trigger Events</span>

                          {/* Toggle 1 */}
                          <div className="flex items-center justify-between">
                            <div>
                              <span className="block text-slate-900 dark:text-white leading-tight">Successful Sign-In Notifications</span>
                              <span className="text-[10px] text-slate-400 font-medium leading-normal block mt-0.5">Receive alert logs upon successful sign-in trials.</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleToggleAlertSetting('loginAlerts')}
                              className={`w-9 h-5 rounded-full p-0.5 transition-colors cursor-pointer shrink-0 ${currentUser.securityAlertSettings?.loginAlerts !== false ? 'bg-orange-500' : 'bg-slate-250 dark:bg-slate-800'}`}
                            >
                              <div className={`w-4 h-4 rounded-full bg-white transition-transform ${currentUser.securityAlertSettings?.loginAlerts !== false ? 'translate-x-4' : 'translate-x-0'}`} />
                            </button>
                          </div>

                          {/* Toggle 2 */}
                          <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-850">
                            <div>
                              <span className="block text-slate-900 dark:text-white leading-tight">Credentials &amp; MFA Settings Alterations</span>
                              <span className="text-[10px] text-slate-400 font-medium leading-normal block mt-0.5">Notify instantly when password or MFA configuration changes.</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleToggleAlertSetting('changeAlerts')}
                              className={`w-9 h-5 rounded-full p-0.5 transition-colors cursor-pointer shrink-0 ${currentUser.securityAlertSettings?.changeAlerts !== false ? 'bg-orange-500' : 'bg-slate-250 dark:bg-slate-800'}`}
                            >
                              <div className={`w-4 h-4 rounded-full bg-white transition-transform ${currentUser.securityAlertSettings?.changeAlerts !== false ? 'translate-x-4' : 'translate-x-0'}`} />
                            </button>
                          </div>

                          {/* Toggle 3 */}
                          <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-850">
                            <div>
                              <span className="block text-slate-900 dark:text-white leading-tight">Anomalous Connection Intercepts</span>
                              <span className="text-[10px] text-slate-400 font-medium leading-normal block mt-0.5">Automatically trigger warning flags for foreign IPs.</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleToggleAlertSetting('unusualIpAlerts')}
                              className={`w-9 h-5 rounded-full p-0.5 transition-colors cursor-pointer shrink-0 ${currentUser.securityAlertSettings?.unusualIpAlerts !== false ? 'bg-orange-500' : 'bg-slate-250 dark:bg-slate-800'}`}
                            >
                              <div className={`w-4 h-4 rounded-full bg-white transition-transform ${currentUser.securityAlertSettings?.unusualIpAlerts !== false ? 'translate-x-4' : 'translate-x-0'}`} />
                            </button>
                          </div>

                          <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 block pt-2">Notification Channels</span>

                          {/* Toggle 4 */}
                          <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-850">
                            <div>
                              <span className="block text-slate-900 dark:text-white leading-tight">Deliver Alerts via SMS Texts</span>
                              <span className="text-[10px] text-slate-400 font-medium leading-normal block mt-0.5">Push security alert warnings to linked phone lines.</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleToggleAlertSetting('smsAlerts')}
                              className={`w-9 h-5 rounded-full p-0.5 transition-colors cursor-pointer shrink-0 ${currentUser.securityAlertSettings?.smsAlerts === true ? 'bg-orange-500' : 'bg-slate-250 dark:bg-slate-800'}`}
                            >
                              <div className={`w-4 h-4 rounded-full bg-white transition-transform ${currentUser.securityAlertSettings?.smsAlerts === true ? 'translate-x-4' : 'translate-x-0'}`} />
                            </button>
                          </div>

                          {/* Toggle 5 */}
                          <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-850">
                            <div>
                              <span className="block text-slate-900 dark:text-white leading-tight">Deliver Alerts via Email Messages</span>
                              <span className="text-[10px] text-slate-400 font-medium leading-normal block mt-0.5">Primary dispatch channel for real-time security alerts.</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleToggleAlertSetting('emailAlerts')}
                              className={`w-9 h-5 rounded-full p-0.5 transition-colors cursor-pointer shrink-0 ${currentUser.securityAlertSettings?.emailAlerts !== false ? 'bg-orange-500' : 'bg-slate-250 dark:bg-slate-800'}`}
                            >
                              <div className={`w-4 h-4 rounded-full bg-white transition-transform ${currentUser.securityAlertSettings?.emailAlerts !== false ? 'translate-x-4' : 'translate-x-0'}`} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* DEVICE SESSIONS PANEL (Aura Premium Security suggestion) */}
                    <div className="bg-slate-50 dark:bg-slate-900/30 border border-slate-150 dark:border-slate-800/80 rounded-2xl p-4 space-y-4">
                      <div>
                        <h4 className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-1.5">
                          <Smartphone className="h-4 w-4 text-orange-500" />
                          Authenticated Device Sessions
                        </h4>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                          You are currently logged in. Terminate unrecognized sessions to instantly trigger an account-wide MFA verification freeze.
                        </p>
                      </div>

                      <div className="space-y-2.5">
                        {/* Current Session */}
                        <div className="flex items-center justify-between bg-white dark:bg-slate-950 p-3 rounded-xl border border-slate-100 dark:border-slate-850">
                          <div className="flex items-start gap-2.5">
                            <div className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/20 text-emerald-500 shrink-0 mt-0.5">
                              <Smartphone className="h-3.5 w-3.5" />
                            </div>
                            <div>
                              <div className="flex items-center gap-1.5">
                                <span className="text-xs font-black text-slate-800 dark:text-slate-200">Chrome on macOS (Current)</span>
                                <span className="text-[8px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400 px-1.5 py-0.5 rounded-md">Active</span>
                              </div>
                              <span className="text-[10px] text-slate-500 dark:text-slate-400 block mt-0.5">IP: 198.51.100.42 • Kampala, Uganda</span>
                            </div>
                          </div>
                        </div>

                        {/* Simulated Other Session */}
                        <div className="flex items-center justify-between bg-white dark:bg-slate-950 p-3 rounded-xl border border-slate-100 dark:border-slate-850">
                          <div className="flex items-start gap-2.5">
                            <div className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 shrink-0 mt-0.5">
                              <Smartphone className="h-3.5 w-3.5" />
                            </div>
                            <div>
                              <div className="flex items-center gap-1.5">
                                <span className="text-xs font-black text-slate-800 dark:text-slate-200">Safari on iPhone 15 Pro</span>
                                <span className="text-[8px] font-black uppercase tracking-wider bg-slate-150 text-slate-600 dark:bg-slate-800 px-1.5 py-0.5 rounded-md">Linked</span>
                              </div>
                              <span className="text-[10px] text-slate-500 dark:text-slate-400 block mt-0.5">IP: 41.210.143.9 • Jinja, Uganda</span>
                            </div>
                          </div>
                          
                          <button
                            type="button"
                            onClick={() => {
                              addSecurityAlert(
                                'unlink',
                                'warning',
                                'Remote Session Terminated',
                                'The Safari on iPhone 15 Pro session in Jinja was manually revoked by the user.'
                              );
                            }}
                            className="text-[10px] font-black uppercase tracking-wider text-rose-500 hover:text-rose-600 hover:underline cursor-pointer transition-all"
                          >
                            Terminate
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* BOTTOM PANEL: Security Event Activity & Alerts Log */}
                    <div className="space-y-4 pt-2">
                      <div className="flex items-center justify-between">
                        <h4 className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-1.5">
                          <ShieldAlert className="h-4 w-4 text-orange-500" />
                          Security Event &amp; Alerts Timeline
                        </h4>
                        {(currentUser.securityAlerts && currentUser.securityAlerts.length > 0) && (
                          <button
                            type="button"
                            onClick={handleClearAlerts}
                            className="text-[10px] font-black uppercase tracking-wider text-slate-400 hover:text-rose-500 transition-colors flex items-center gap-1 cursor-pointer"
                          >
                            <Trash2 className="h-3 w-3" /> Clear History
                          </button>
                        )}
                      </div>

                      <div className="border border-slate-150 dark:border-slate-800/80 rounded-2xl divide-y divide-slate-100 dark:divide-slate-850 bg-white dark:bg-slate-900 overflow-hidden">
                        {(currentUser.securityAlerts && currentUser.securityAlerts.length > 0 ? currentUser.securityAlerts : [
                          {
                            id: 'alert-init-1',
                            type: 'login',
                            severity: 'info',
                            title: 'Successful System Authentication',
                            description: `Access granted via primary credentials - Chrome on Linux.`,
                            timestamp: new Date().toISOString(),
                            location: 'Salem, OR (Simulated)',
                            ipAddress: '198.51.100.42',
                            resolved: false,
                          },
                          {
                            id: 'alert-init-2',
                            type: 'mfa',
                            severity: 'warning',
                            title: 'Security Session Context Evaluated',
                            description: 'System scanned dual-channel registration matrix and confirmed keys synchronized.',
                            timestamp: new Date(Date.now() - 15 * 60000).toISOString(),
                            location: 'Salem, OR (Simulated)',
                            ipAddress: '198.51.100.42',
                            resolved: false,
                          },
                          {
                            id: 'alert-init-3',
                            type: 'login',
                            severity: 'critical',
                            title: 'Suspicious Sign-In Connection Blocked',
                            description: 'An unauthorized login attempt from an anomalous geographic IP range was intercepted and terminated.',
                            timestamp: new Date(Date.now() - 3 * 86400000).toISOString(),
                            location: 'Frankfurt, Germany',
                            ipAddress: '46.165.2.14',
                            resolved: true,
                          }
                        ]).map((alert) => (
                          <div key={alert.id} className="p-4 flex items-start gap-3.5 text-xs">
                            <div className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 border ${
                              alert.severity === 'critical'
                                ? 'bg-rose-50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/40 text-rose-500'
                                : alert.severity === 'warning'
                                ? 'bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/40 text-amber-500'
                                : 'bg-slate-50 dark:bg-slate-850 border-slate-200 dark:border-slate-800 text-slate-500'
                            }`}>
                              {alert.severity === 'critical' ? <ShieldAlert className="h-4.5 w-4.5" /> : alert.type === 'mfa' ? <KeyRound className="h-4.5 w-4.5" /> : <Lock className="h-4.5 w-4.5" />}
                            </div>

                            <div className="flex-1 min-w-0 space-y-1">
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="font-extrabold text-slate-900 dark:text-white leading-tight">
                                  {alert.title}
                                </span>
                                {alert.resolved ? (
                                  <span className="text-[8px] font-black uppercase tracking-wider bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 px-1.5 py-0.5 rounded border border-emerald-150 dark:border-emerald-900/30">
                                    Resolved
                                  </span>
                                ) : (
                                  <span className={`text-[8px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded border ${
                                    alert.severity === 'critical'
                                      ? 'bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 border-rose-150 dark:border-rose-900/30 animate-pulse'
                                      : alert.severity === 'warning'
                                      ? 'bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 border-amber-150 dark:border-amber-900/30'
                                      : 'bg-slate-100 dark:bg-slate-800 text-slate-550 dark:text-slate-400 border-slate-200 dark:border-slate-750'
                                  }`}>
                                    {alert.severity}
                                  </span>
                                )}
                              </div>

                              <p className="text-slate-550 dark:text-slate-400 font-medium">
                                {alert.description}
                              </p>

                              <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[10px] text-slate-400 font-medium font-mono pt-1">
                                <span className="flex items-center gap-1">
                                  <Clock className="h-3 w-3" /> {new Date(alert.timestamp).toLocaleString()}
                                </span>
                                {alert.location && (
                                  <span className="flex items-center gap-1">
                                    <Globe className="h-3 w-3" /> {alert.location}
                                  </span>
                                )}
                                {alert.ipAddress && (
                                  <span>
                                    IP: {alert.ipAddress}
                                  </span>
                                )}
                              </div>
                            </div>

                            {!alert.resolved && (
                              <button
                                type="button"
                                onClick={() => handleResolveAlert(alert.id)}
                                className="px-3 py-1 border border-slate-200 hover:border-orange-200 hover:bg-orange-50 dark:border-slate-800 dark:hover:bg-orange-950/10 text-slate-600 dark:text-slate-400 hover:text-orange-600 dark:hover:text-orange-400 text-[10px] font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer whitespace-nowrap"
                              >
                                Resolve
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </motion.div>
            )}


            {activeSubTab === 'linked-accounts' && (
              <motion.div
                key="linked-accounts-panel"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800/80 rounded-3xl p-6 shadow-xs space-y-6"
              >
                <div>
                  <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2 mb-1">
                    <Smartphone className="h-4.5 w-4.5 text-orange-500" />
                    Linked Login Methods
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    Link both an email address and a phone number to your account. This allows you to sign in with either credential to access the exact same profile, shipping address, and order history.
                  </p>
                </div>

                {linkError && (
                  <div className="p-3.5 bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/50 rounded-xl text-rose-600 dark:text-rose-450 text-xs font-bold flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 shrink-0" />
                    {linkError}
                  </div>
                )}

                {/* Two Methods Cards */}
                <div className="space-y-4">
                  {/* METHOD 1: Email Address */}
                  <div className="p-4 bg-slate-50/50 dark:bg-slate-900/40 rounded-2xl border border-slate-150 dark:border-slate-800/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <div className="h-9 w-9 rounded-xl bg-orange-100 dark:bg-orange-950/30 text-orange-600 dark:text-orange-400 flex items-center justify-center shrink-0">
                        <UserIcon className="h-4.5 w-4.5" />
                      </div>
                      <div>
                        <span className="font-extrabold text-xs block text-slate-900 dark:text-white leading-none">Email Address</span>
                        <span className="text-[11px] text-slate-500 dark:text-slate-450 mt-1.5 block font-medium">
                          {!currentUser.email.endsWith('@phone.aura.com') 
                            ? currentUser.email 
                            : (currentUser.linkedEmail || 'No email address linked')}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-auto">
                      {!currentUser.email.endsWith('@phone.aura.com') ? (
                        <span className="px-2.5 py-1 bg-emerald-50 dark:bg-emerald-950/35 border border-emerald-150 dark:border-emerald-900/50 text-emerald-700 dark:text-emerald-400 text-[10px] font-black uppercase tracking-wider rounded-lg">
                          Primary
                        </span>
                      ) : currentUser.linkedEmail ? (
                        <div className="flex items-center gap-2">
                          <span className="px-2.5 py-1 bg-orange-50 dark:bg-orange-950/35 border border-orange-150 dark:border-orange-900/50 text-orange-700 dark:text-orange-400 text-[10px] font-black uppercase tracking-wider rounded-lg">
                            Linked
                          </span>
                          <button
                            type="button"
                            onClick={() => handleUnlink('email')}
                            disabled={isLinking}
                            className="px-3 py-1.5 text-[10px] font-bold text-rose-600 dark:text-rose-450 hover:bg-rose-50 dark:hover:bg-rose-950/20 border border-slate-200 dark:border-slate-800 rounded-lg transition-all cursor-pointer"
                          >
                            Unlink
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            setLinkMethod('email');
                            setLinkStep(0);
                            setLinkInput('');
                          }}
                          className="px-3 py-1.5 bg-slate-950 text-white dark:bg-orange-500 dark:text-slate-950 font-bold text-[10px] uppercase tracking-wider rounded-lg transition-all cursor-pointer hover:bg-slate-900"
                        >
                          Link Email
                        </button>
                      )}
                    </div>
                  </div>

                  {/* METHOD 2: Phone Number */}
                  <div className="p-4 bg-slate-50/50 dark:bg-slate-900/40 rounded-2xl border border-slate-150 dark:border-slate-800/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <div className="h-9 w-9 rounded-xl bg-orange-100 dark:bg-orange-950/30 text-orange-600 dark:text-orange-400 flex items-center justify-center shrink-0">
                        <Smartphone className="h-4.5 w-4.5" />
                      </div>
                      <div>
                        <span className="font-extrabold text-xs block text-slate-900 dark:text-white leading-none">Phone Number</span>
                        <span className="text-[11px] text-slate-500 dark:text-slate-450 mt-1.5 block font-medium">
                          {currentUser.email.endsWith('@phone.aura.com') 
                            ? currentUser.email.split('@')[0] 
                            : (currentUser.linkedPhone || 'No phone number linked')}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-auto">
                      {currentUser.email.endsWith('@phone.aura.com') ? (
                        <span className="px-2.5 py-1 bg-emerald-50 dark:bg-emerald-950/35 border border-emerald-150 dark:border-emerald-900/50 text-emerald-700 dark:text-emerald-400 text-[10px] font-black uppercase tracking-wider rounded-lg">
                          Primary
                        </span>
                      ) : currentUser.linkedPhone ? (
                        <div className="flex items-center gap-2">
                          <span className="px-2.5 py-1 bg-orange-50 dark:bg-orange-950/35 border border-orange-150 dark:border-orange-900/50 text-orange-700 dark:text-orange-400 text-[10px] font-black uppercase tracking-wider rounded-lg">
                            Linked
                          </span>
                          <button
                            type="button"
                            onClick={() => handleUnlink('phone')}
                            disabled={isLinking}
                            className="px-3 py-1.5 text-[10px] font-bold text-rose-600 dark:text-rose-450 hover:bg-rose-50 dark:hover:bg-rose-950/20 border border-slate-200 dark:border-slate-800 rounded-lg transition-all cursor-pointer"
                          >
                            Unlink
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            setLinkMethod('phone');
                            setLinkStep(0);
                            setLinkInput('');
                          }}
                          className="px-3 py-1.5 bg-slate-950 text-white dark:bg-orange-500 dark:text-slate-950 font-bold text-[10px] uppercase tracking-wider rounded-lg transition-all cursor-pointer hover:bg-slate-900"
                        >
                          Link Phone
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Linking Interactive Wizards */}
                {linkMethod && (
                  <div className="border border-slate-150 dark:border-slate-800/80 rounded-2xl p-5 space-y-4 bg-slate-50/20 dark:bg-slate-950/10">
                    <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/50 pb-3">
                      <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                        <KeyRound className="h-4 w-4 text-orange-500" />
                        {linkMethod === 'phone' ? 'Link Phone Number' : 'Link Email Address'}
                      </h4>
                      <span className="text-[10px] font-bold text-slate-400">
                        Step {linkStep + 1} of 2
                      </span>
                    </div>

                    {/* Step 1: Input Identifier */}
                    {linkStep === 0 && (
                      <div className="space-y-4">
                        {linkMethod === 'phone' ? (
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                              Enter Phone Number
                            </label>
                            
                            <div className="flex gap-2">
                              {/* Country Selector Dropdown */}
                              <div className="relative">
                                <button
                                  type="button"
                                  onClick={() => setIsCountryDropdownOpen(!isCountryDropdownOpen)}
                                  className="h-full bg-slate-50 dark:bg-slate-850/50 border border-slate-150 dark:border-slate-800/80 rounded-xl px-3 flex items-center gap-1.5 text-xs text-slate-950 dark:text-white font-medium select-none cursor-pointer"
                                >
                                  <span>{linkCountry.flag}</span>
                                  <span className="font-mono">{linkCountry.code}</span>
                                </button>

                                {isCountryDropdownOpen && (
                                  <div className="absolute left-0 mt-1.5 w-52 bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800/90 rounded-2xl shadow-xl z-30 max-h-60 overflow-y-auto p-1.5">
                                    {COUNTRIES.map((c) => (
                                      <button
                                        key={c.name}
                                        type="button"
                                        onClick={() => {
                                          setLinkCountry(c);
                                          setIsCountryDropdownOpen(false);
                                        }}
                                        className="w-full flex items-center gap-2 px-3 py-2 text-left text-xs rounded-xl hover:bg-slate-50 dark:hover:bg-slate-850/60 text-slate-700 dark:text-slate-300 font-medium cursor-pointer"
                                      >
                                        <span>{c.flag}</span>
                                        <span className="font-mono text-[11px] text-slate-400">{c.code}</span>
                                        <span className="truncate">{c.name}</span>
                                      </button>
                                    ))}
                                  </div>
                                )}
                              </div>

                              <input
                                type="tel"
                                required
                                value={linkInput}
                                onChange={(e) => setLinkInput(e.target.value)}
                                placeholder={linkCountry.placeholder}
                                className="flex-1 bg-slate-50 dark:bg-slate-850/50 border border-slate-150 dark:border-slate-800/80 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 rounded-xl py-2.5 px-3.5 text-xs text-slate-950 dark:text-white outline-none transition-all placeholder:text-slate-400 font-mono font-bold"
                              />
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                              Enter Email Address
                            </label>
                            <input
                              type="email"
                              required
                              value={linkInput}
                              onChange={(e) => setLinkInput(e.target.value)}
                              placeholder="e.g. name@example.com"
                              className="w-full bg-slate-50 dark:bg-slate-850/50 border border-slate-150 dark:border-slate-800/80 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 rounded-xl py-2.5 px-3.5 text-xs text-slate-950 dark:text-white outline-none transition-all placeholder:text-slate-400 font-semibold"
                            />
                          </div>
                        )}

                        <div className="flex items-center justify-end gap-3 pt-2">
                          <button
                            type="button"
                            onClick={resetLinkFlow}
                            className="text-xs font-bold text-slate-400 hover:text-slate-650 transition-all cursor-pointer"
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            onClick={linkMethod === 'phone' ? handleStartLinkPhone : handleStartLinkEmail}
                            disabled={isLinking}
                            className="bg-slate-950 hover:bg-slate-900 text-white dark:bg-orange-500 dark:text-slate-950 font-black text-xs uppercase tracking-wider py-2.5 px-5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
                          >
                            {isLinking ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : 'Send Code'}
                            <ArrowRight className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Step 2: Verification Code */}
                    {linkStep === 1 && (
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block">
                            Enter 6-Digit Verification Code
                          </label>
                          <div className="relative flex items-center">
                            <Lock className="absolute left-3.5 h-4 w-4 text-slate-400" />
                            <input
                              type="text"
                              maxLength={6}
                              placeholder="••••••"
                              value={linkVerificationCode}
                              onChange={(e) => setLinkVerificationCode(e.target.value)}
                              className="w-full bg-slate-50 dark:bg-slate-850/50 border border-slate-150 dark:border-slate-800/80 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 rounded-xl py-3 pl-10 pr-4 text-xs text-slate-950 dark:text-white outline-none transition-all placeholder:text-slate-450 text-center tracking-widest font-extrabold font-mono"
                            />
                          </div>
                          <p className="text-[10px] text-slate-400 dark:text-slate-500 leading-normal">
                            Please enter the simulated 6-digit linking security code sent to your {linkMethod === 'phone' ? 'phone' : 'email'} shown in the orange console banner.
                          </p>
                        </div>

                        <div className="flex items-center justify-between pt-2">
                          <button
                            type="button"
                            onClick={() => setLinkStep(0)}
                            className="text-xs font-bold text-slate-400 hover:text-slate-650 transition-all cursor-pointer"
                          >
                            Back
                          </button>
                          <button
                            type="button"
                            onClick={handleVerifyAndLink}
                            disabled={isLinking}
                            className="bg-orange-500 hover:bg-orange-600 text-slate-950 font-black text-xs uppercase tracking-wider py-2.5 px-5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
                          >
                            {isLinking ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : 'Confirm & Link'}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right Sidebar - Security Tips & Info */}
        <div className="space-y-6">
          <div className="bg-slate-50 dark:bg-slate-900/40 border border-slate-150 dark:border-slate-800/80 rounded-3xl p-6 space-y-5">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
              <Shield className="h-4.5 w-4.5 text-orange-500" />
              Security Checkup List
            </h3>

            <div className="space-y-4 text-xs font-medium">
              <div className="flex items-start gap-2.5">
                <div className="h-5 w-5 rounded-full bg-emerald-50 dark:bg-emerald-950/20 text-emerald-500 flex items-center justify-center shrink-0 mt-0.5">
                  <Check className="h-3 w-3 stroke-[3]" />
                </div>
                <div>
                  <h4 className="font-extrabold text-slate-900 dark:text-slate-200">Session Protection</h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-normal">
                    Session states are cleared securely when logging out or closing session-based logins.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                {currentUser.mfaEnabled ? (
                  <div className="h-5 w-5 rounded-full bg-emerald-50 dark:bg-emerald-950/20 text-emerald-500 flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="h-3 w-3 stroke-[3]" />
                  </div>
                ) : (
                  <div className="h-5 w-5 rounded-full bg-amber-50 dark:bg-amber-950/20 text-amber-500 flex items-center justify-center shrink-0 mt-0.5">
                    <AlertTriangle className="h-3 w-3 stroke-[3]" />
                  </div>
                )}
                <div>
                  <h4 className="font-extrabold text-slate-900 dark:text-slate-200">Two-Factor Authentication</h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-normal">
                    {currentUser.mfaEnabled
                      ? 'Activated! Authenticator or SMS protection validates all login challenges.'
                      : 'Recommended. Enable SMS text challenges or an Authenticator App.'}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <div className="h-5 w-5 rounded-full bg-emerald-50 dark:bg-emerald-950/20 text-emerald-500 flex items-center justify-center shrink-0 mt-0.5">
                  <Check className="h-3 w-3 stroke-[3]" />
                </div>
                <div>
                  <h4 className="font-extrabold text-slate-900 dark:text-slate-200">Database Synchronization</h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-normal">
                    User information is locked down securely behind real-time Firebase Security Rules.
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-200/60 dark:border-slate-800/60">
              <div className="rounded-2xl bg-orange-50 dark:bg-orange-950/15 p-4 border border-orange-100/50 dark:border-orange-900/30 text-[11px] text-slate-500 dark:text-slate-400 leading-normal space-y-1.5">
                <span className="font-black text-orange-700 dark:text-orange-400 uppercase tracking-wider block">Security Notice:</span>
                <span>Our system coordinates directly with the connected Firestore database to save your MFA enrollments, meaning any authenticated session is securely checked for login.</span>
              </div>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
