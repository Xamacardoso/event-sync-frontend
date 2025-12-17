import { Fragment, useEffect, useState, useRef } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { X, Printer, Loader2 } from 'lucide-react';
import { registrationService, CertificateData } from '@/services/registrations';
import { toast } from 'sonner';
import { useReactToPrint } from 'react-to-print';
import { Certificate } from './Certificate';

interface CertificateModalProps {
    isOpen: boolean;
    onClose: () => void;
    registrationId: string;
}

export const CertificateModal = ({ isOpen, onClose, registrationId }: CertificateModalProps) => {
    const [data, setData] = useState<CertificateData | null>(null);
    const [loading, setLoading] = useState(false);

    // Ref para o componente que será impresso
    const componentRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (isOpen && registrationId) {
            loadCertificate();
        }
    }, [isOpen, registrationId]);

    const loadCertificate = async () => {
        setLoading(true);
        try {
            const certData = await registrationService.getCertificate(registrationId);
            setData(certData);
        } catch (error) {
            console.error(error);
            toast.error('Erro ao carregar o certificado.');
            onClose();
        } finally {
            setLoading(false);
        }
    };

    const handlePrint = useReactToPrint({
        contentRef: componentRef,
        documentTitle: `Certificado - ${data?.eventName}`,
        onAfterPrint: () => toast.success('Impressão iniciada!'),
        // Remove o corpo da página durante a impressão para evitar bugs visuais
        bodyClass: 'print-body-fix'
    });

    return (
        <Transition appear show={isOpen} as={Fragment}>
            <Dialog as="div" className="relative z-50" onClose={onClose}>
                <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm print:hidden" />
                </Transition.Child>

                <div className="fixed inset-0 overflow-y-auto print:overflow-visible">
                    <div className="flex min-h-full items-center justify-center p-4 text-center print:p-0 print:block">
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 scale-95"
                            enterTo="opacity-100 scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 scale-100"
                            leaveTo="opacity-0 scale-95"
                        >
                            <Dialog.Panel className="w-full max-w-4xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all print:shadow-none print:w-full print:max-w-none print:p-0 print:rounded-none">

                                {/* Header - Hidden on Print */}
                                <div className="flex justify-between items-center mb-6 print:hidden">
                                    <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900">
                                        Certificado de Participação
                                    </Dialog.Title>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={handlePrint}
                                            disabled={loading || !data}
                                            className="inline-flex justify-center rounded-md border border-transparent bg-blue-100 px-4 py-2 text-sm font-medium text-blue-900 hover:bg-blue-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            <Printer className="w-4 h-4 mr-2" />
                                            Imprimir
                                        </button>
                                        <button
                                            onClick={onClose}
                                            className="inline-flex justify-center rounded-md border border-transparent bg-gray-100 px-4 py-2 text-sm font-medium text-gray-900 hover:bg-gray-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-500 focus-visible:ring-offset-2"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>

                                {loading ? (
                                    <div className="flex justify-center items-center py-20 print:hidden">
                                        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                                    </div>
                                ) : data ? (
                                    <div className="overflow-auto print:overflow-visible">
                                        {/* Componente envelopado para o react-to-print */}
                                        <div className="min-w-[800px] print:min-w-0">
                                            <Certificate ref={componentRef} data={data} />
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-center py-10 text-gray-500 print:hidden">
                                        Não foi possível carregar os dados do certificado.
                                    </div>
                                )}
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
};
