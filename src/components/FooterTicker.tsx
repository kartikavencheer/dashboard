export default function FooterTicker({ text }: { text: string }) {
  return (
    <div className="h-10 bg-gradient-to-r from-blue-900 to-indigo-900 text-white flex items-center overflow-hidden">
      <div className="ticker whitespace-nowrap">
        {text} &nbsp;&nbsp;&nbsp;&nbsp; {text}
      </div>

      <style>
        {`
          .ticker {
            display: inline-block;
            padding-left: 100%;
            animation: scroll 25s linear infinite;
          }

          @keyframes scroll {
            0%   { transform: translateX(0); }
            100% { transform: translateX(-100%); }
          }
        `}
      </style>
    </div>
  );
}
