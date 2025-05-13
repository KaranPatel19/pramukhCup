import React, { useState } from 'react';

interface HelloProps {
  name?: string;
}

export const Hello: React.FC<HelloProps> = ({ name = "World" }) => {
  const [counter, setCounter] = useState<number>(0);

  const increment = () => {
    setCounter(counter + 1);
  };

  return (
    <div>
      <button onClick={increment}>Click Me</button>
      <p>You've pressed the button {counter} times.</p>
    </div>
  );
};