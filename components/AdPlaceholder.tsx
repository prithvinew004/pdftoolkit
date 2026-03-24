export default function AdPlaceholder({ slot = "horizontal" }: { slot?: "horizontal" | "sidebar" | "in-article" }) {
  const h = slot === "sidebar" ? "h-64" : slot === "in-article" ? "h-24" : "h-20";
  return (
    <div className={`w-full ${h} rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-700 flex items-center justify-center text-sm text-gray-400 dark:text-gray-600 my-6`}>
      {/* Google AdSense placeholder — replace data-ad-slot with your ID */}
      {/* <ins className="adsbygoogle" style={{display:"block"}} data-ad-client="ca-pub-XXXXXXX" data-ad-slot="XXXXXXX" data-ad-format="auto" data-full-width-responsive="true"></ins> */}
      Advertisement — {slot}
    </div>
  );
}
