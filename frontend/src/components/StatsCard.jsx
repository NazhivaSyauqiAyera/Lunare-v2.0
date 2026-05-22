function StatsCard({ title, value, color }) {

  return (
    <div className={`${color} p-6 rounded-3xl`}>

      <p className="text-gray-500 mb-2">
        {title}
      </p>

      <h2 className="text-2xl font-bold">
        {value}
      </h2>

    </div>
  );

}

export default StatsCard;