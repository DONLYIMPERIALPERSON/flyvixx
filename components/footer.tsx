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
                            Amet minim mollit non deserunt ullamco est sit aliqua dolor do amet sint. Velit officia consequat duis enim velit mollit.
                        </p>
                    </div>
                </div>
            </footer>
            <div className="border-t border-[#ffd700]">
                <p className="text-gray-500 py-6 text-center">
                    Copyright {new Date().getFullYear()} &copy;
                    <a href="https://prebuiltui.com?utm_source=mapple">
                        PrebuiltUI
                    </a>{' '}
                    All Right Reserved.
                </p>
            </div>
        </>
    );
};