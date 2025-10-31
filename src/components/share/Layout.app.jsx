const LayoutApp = (props) => {
  // Layout wrapper: intentionally minimal — API calls were removed so
  // authentication/account initialization is handled in the auth context.
  return <>{props.children}</>;
};

export default LayoutApp;
