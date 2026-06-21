interface Props {
    trades: any[];
  }
  
  export default function AIReview({ trades }: Props) {
    return (
      <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-3">
        <h2 className="text-sm font-bold text-white">
          AI Trade Review
        </h2>
  
        <div className="mt-2 space-y-1 text-xs text-zinc-400">
          <p>• Strong win rate this month</p>
  
          <p>• Long positions perform better</p>
  
          <p>• Trading consistency improving</p>
        </div>
      </div>
    );
  }