const Skeleton = ({ className = '', variant = 'text' }) => {
  const variants = {
    text: 'h-4 w-3/4',
    title: 'h-6 w-1/2',
    circle: 'h-10 w-10 rounded-full',
    card: 'h-24 w-full',
    amount: 'h-8 w-24',
  };

  return (
    <div className={`skeleton ${variants[variant] || variants.text} ${className}`} />
  );
};

export default Skeleton;
