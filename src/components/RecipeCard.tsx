import Link from "next/link";

type Recipe = {
  id: string;
  title: string;
  image_url?: string;
  cook_time?: number;
  effort?: string;
};

const placeholder = "/images/placeholder.png";

export default function RecipeCard({ r }: { r: Recipe }) {
  return (
    <Link
      href={`/recipes/${r.id}`}
      className="block border rounded-xl overflow-hidden shadow hover:shadow-lg transition bg-white"
    >
      <img
        src={r.image_url || placeholder}
        alt={r.title}
        className="w-full h-48 object-cover"
      />
      <div className="p-4">
        <h2 className="text-lg font-bold text-grandma-brown">{r.title}</h2>
        {r.cook_time && (
          <p className="text-sm text-gray-600">⏱ {r.cook_time} min</p>
        )}
        {r.effort && <p className="text-sm text-gray-600">💡 {r.effort}</p>}
      </div>
    </Link>
  );
}
