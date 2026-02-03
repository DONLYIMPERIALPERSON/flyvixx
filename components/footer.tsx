import Image from "next/image";

export const Footer = () => {
    return (
        <>
            <footer className="px-6 md:px-16 lg:px-24 xl:px-32 border-t border-[#ffd700]">
                <div className="border-x p-8 md:p-14 border-[#ffd700]">
                    <div>
                        <Image
                            src="/logo-mark.svg"
                            alt="Logo Mark"
                            width={30}
                            height={30}
                        />
                        <p className="mt-6 text-sm/7 max-w-sm text-gray-500">
                            FLYVIXX is a premier digital rewards ecosystem where capital security meets high-performance gaming. Our mission is to provide a protected environment for users to leverage their assets, unlock daily growth, and experience the next generation of risk-free engagement.
                        </p>
                    </div>
                </div>
            </footer>
            <div className="border-t border-[#ffd700]">
                <p className="text-gray-500 py-6 text-center">
                    Copyright {new Date().getFullYear()} &copy;
                    <a href="https://prebuiltui.com?utm_source=mapple">
                        Flyvixx
                    </a>{' '}
                    All Right Reserved.
                </p>
            </div>
        </>
    );
};