const WEB_CREATE_PAGE_URL="http://localhost:5174/create"

export const Splash = () => {
  return (
    <a href={WEB_CREATE_PAGE_URL} target="_blank" rel="noopener">
      <button className="submit-button">Login Here</button>
    </a>
  );
};
