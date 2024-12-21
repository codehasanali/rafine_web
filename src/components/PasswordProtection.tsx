import React, { useState } from 'react';
import { Input, Button, message } from 'antd';
import { useNavigate } from 'react-router-dom';

interface PasswordProtectionProps {
    children: React.ReactNode;
}

const PasswordProtection: React.FC<PasswordProtectionProps> = ({ children }) => {
    const [password, setPassword] = useState('');
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const navigate = useNavigate();

    const handlePasswordSubmit = () => {
        if (password === 'Mertcan.05') {
            setIsAuthenticated(true);
        } else {
            message.error('Yanlış şifre!');
        }
    };

    if (!isAuthenticated) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
                <div className="p-8 bg-white rounded-lg shadow-md w-96">
                    <h2 className="text-2xl font-bold mb-4 text-center">Şifre Doğrulama</h2>
                    <Input.Password
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Şifreyi giriniz"
                        className="mb-4"
                        onPressEnter={handlePasswordSubmit}
                    />
                    <Button type="primary" onClick={handlePasswordSubmit} block>
                        Giriş
                    </Button>
                </div>
            </div>
        );
    }

    return <>{children}</>;
};

export default PasswordProtection; 