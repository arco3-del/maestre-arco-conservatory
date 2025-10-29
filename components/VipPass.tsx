import React from 'react';
import { useLanguage } from '../context/LanguageContext';

const VipPass: React.FC = () => {
    const { t } = useLanguage();

    const benefits = [
        t('vipBenefit1'),
        t('vipBenefit2'),
        t('vipBenefit3'),
    ];

    return (
        <div className="bg-gradient-to-br from-gray-900 via-black to-gray-900 rounded-lg shadow-2xl shadow-yellow-500/30 border-2 border-yellow-500 p-6 text-center animate-fade-in-up">
            <h2 className="text-3xl font-bold text-yellow-400" style={{ fontFamily: 'var(--font-serif)' }}>{t('vipPassTitle')}</h2>
            <p className="text-gray-300 text-sm mb-4">{t('vipPassSubtitle')}</p>
            
            <div className="my-6 p-4 bg-black/30 rounded-md border border-yellow-500/30">
                <p className="text-yellow-100 text-sm">{t('vipPassDescription')}</p>
                <ul className="mt-4 space-y-2 text-left">
                    {benefits.map((benefit, index) => (
                        <li key={index} className="flex items-center gap-3">
                            <span className="text-yellow-400">★</span>
                            <span className="text-gray-200 text-sm">{benefit}</span>
                        </li>
                    ))}
                </ul>
            </div>
             <p className="text-xs text-gray-500 tracking-widest uppercase">Maestre Arco Conservatory</p>
        </div>
    );
};

export default VipPass;
