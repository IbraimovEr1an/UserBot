interface UserAvatarProps {
  id: number | string;
  firstName: string;
  lastName: string;
  size?: number;
}

const AVATAR_COLORS = [
  ["#FF885E", "#FF516A"],
  ["#FFCD6A", "#FFA85C"],
  ["#82B1FF", "#665FFF"],
  ["#A0DE7E", "#54CB68"],
  ["#53EDD6", "#28C9B7"],
  ["#72D5FD", "#2A9EF1"],
  ["#E0A2F3", "#D669ED"],
];

const getColor = (id: number | string): string[] => {
  const ids = typeof id === "string" ? parseInt(id, 10) : id;
  const idx = Math.abs(ids) % AVATAR_COLORS.length;
  return AVATAR_COLORS[idx];
};

const getName = (firstName: string, lastName: string): string => {
  let Name: string = "";
  const last = lastName?.trim() ?? "";
  const first = firstName?.trim() ?? "";
  const words = (value: string) => value.trim().split(/\s+/).filter(Boolean);

  if (first.length && last.length) Name = firstName[0] + lastName[0];
  else if (first.length) {
    const fromFirst = words(first);
    Name = fromFirst.length >= 2 ? fromFirst[0][0] + fromFirst[1][0] : first[0];
  } else if (last.length) {
    const fromLast = words(last);
    Name = fromLast.length >= 2 ? fromLast[0][0] + fromLast[1][0] : last[0];
  } else Name = "#";

  return Name.toUpperCase();
};

function Avatar({ id, firstName, lastName, size = 48 }: UserAvatarProps) {
  const [colorStart, colorEnd] = getColor(id);
  const Name = getName(firstName, lastName);
  const gradID = `grad-${id}`;

  return (
    <svg width={size} height={size} viewBox="0 0 48 48">
      <defs>
        <linearGradient id={gradID} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={colorStart} />
          <stop offset="100%" stopColor={colorEnd} />
        </linearGradient>
      </defs>
      <circle cx="24" cy="24" r="24" fill={`url(#${gradID})`} />
      <text
        x="24"
        y="24"
        textAnchor="middle"
        dominantBaseline="central"
        fill="white"
        fontSize={size * 0.55}
        fontWeight="500"
        fontFamily="system-ui, sans-serif"
      >
        {Name}
      </text>
    </svg>
  );
}

export default Avatar;
