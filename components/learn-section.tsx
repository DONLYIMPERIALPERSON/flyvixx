export default function LearnSection() {
    const items = [
        { text: "How It Works", image: "/learn/how-it-works.png" },
        { text: "FAQ", image: "/learn/faq.png" },
        { text: "About", image: "/learn/about.png" },
        { text: "How to Start", image: "/learn/how-to-start.png" },
    ];

    return (
        <section className="mx-2 md:mx-12 lg:mx-20 xl:mx-28 py-4">
            <h2 className="text-lg font-bold text-left mb-4">LEARN</h2>
            <div className="grid grid-cols-4 gap-2">
                {items.map((item, index) => (
                    <div key={index} className="bg-[#DCEFEE] border border-gray-200 rounded-lg p-2 text-center shadow-lg">
                        <img src={item.image} alt={item.text} className="w-full h-16 object-cover mb-2 rounded" />
                        <p className="text-xs font-semibold text-[#004B49]">{item.text}</p>
                    </div>
                ))}
            </div>
        </section>
    );
}