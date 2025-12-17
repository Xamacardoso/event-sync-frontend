import { forwardRef } from 'react';
import { CertificateData } from '@/services/registrations';

interface CertificateProps {
    data: CertificateData;
}

export const Certificate = forwardRef<HTMLDivElement, CertificateProps>(({ data }, ref) => {
    return (
        <div ref={ref} className="w-full h-full bg-white p-10 print:p-0">
            <div className="border-[10px] border-double border-gray-200 p-10 text-center relative bg-white print:border-gray-800 print:shadow-none min-h-[600px] flex flex-col justify-center print:h-screen print:w-screen print:box-border">

                {/* Decorative Element - Corner Accents */}
                <div className="absolute top-4 left-4 w-16 h-16 border-t-4 border-l-4 border-blue-900/20 rounded-tl-3xl"></div>
                <div className="absolute top-4 right-4 w-16 h-16 border-t-4 border-r-4 border-blue-900/20 rounded-tr-3xl"></div>
                <div className="absolute bottom-4 left-4 w-16 h-16 border-b-4 border-l-4 border-blue-900/20 rounded-bl-3xl"></div>
                <div className="absolute bottom-4 right-4 w-16 h-16 border-b-4 border-r-4 border-blue-900/20 rounded-br-3xl"></div>

                <div className="relative z-10">
                    <h1 className="text-5xl md:text-6xl font-serif text-gray-900 mb-8 uppercase tracking-[0.2em] font-bold">Certificado</h1>

                    <p className="text-xl md:text-2xl text-gray-600 mb-2 italic font-serif">Certificamos que</p>

                    <h2 className="text-3xl md:text-4xl font-bold text-blue-900 mb-6 border-b-2 border-blue-900/10 inline-block pb-2 px-10">
                        {data.participantName}
                    </h2>

                    <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
                        Participou com êxito do evento <strong className="text-gray-900">{data.eventName}</strong>,
                        realizado em <span className="whitespace-nowrap">{new Date(data.date).toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' })}</span>.
                    </p>

                    <div className="mt-12 flex justify-center gap-16">
                        <div className="text-center">
                            <p className="text-3xl font-bold text-gray-800">{data.workloadHours}h</p>
                            <p className="text-sm text-gray-500 uppercase tracking-widest mt-1">Carga Horária</p>
                        </div>
                        <div className="text-center">
                            <div className="mb-2 w-24 h-24 mx-auto bg-white p-1">
                                {/* QR Code Placeholder or Render */}
                                <img
                                    src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(data.validationCode)}`}
                                    alt="QR Code Validação"
                                    className="w-full h-full object-contain"
                                />
                            </div>
                            <p className="text-xs font-mono text-gray-400 max-w-[150px] mx-auto break-all">{data.validationCode}</p>
                            <p className="text-xs text-gray-500 uppercase tracking-wider mt-1">Cód. Validação</p>
                        </div>
                    </div>

                    <div className="mt-20 flex justify-between items-end text-sm text-gray-400 border-t border-gray-100 pt-8">
                        <div className="text-left">
                            <p className="font-semibold text-gray-500">EventSync Plataforma</p>
                            <p className="text-xs">Certificado gerado digitalmente.</p>
                        </div>
                        <div className="text-right">
                            <p>Emitido em: {new Date().toLocaleDateString('pt-BR')}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
});

Certificate.displayName = 'Certificate';
