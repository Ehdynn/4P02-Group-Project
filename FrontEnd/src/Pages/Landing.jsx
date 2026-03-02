import useUser from "../context/useUser";

const Landing = () => {
  const { isProfessor } = useUser();

  return (
    <p>{isProfessor ? "Prof": "not prof"}</p>
  );
};

export default Landing;
