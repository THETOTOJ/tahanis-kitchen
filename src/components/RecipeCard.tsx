import Link from "next/link";

type Recipe = {
  id: string;
  title: string;
  preview?: string | null;
  cook_time_mins?: number | null;
  effort?: string;
};

export default function RecipeCard({ r }: { r: Recipe }) {
  return (
    <Link
      href={`/recipes/${r.id}`}
      className="block border rounded-xl overflow-hidden shadow hover:shadow-lg transition bg-white"
    >
      <div className="p-4">
        <h2 className="text-lg font-bold text-grandma-brown">{r.title}</h2>
        {r.cook_time_mins && (
          <p className="text-sm text-gray-600">⏱ {r.cook_time_mins} min</p>
        )}
        {r.effort && <p className="text-sm text-gray-600">💡 {r.effort}</p>}
      </div>
    </Link>
  );
}
