// Notice that we pass the props here as a *single* object. This is very
// different from Vue.js, where we would generally pass each prop as a separate
// attribute. In React, we (again, generally) pass the props as a single object
// and then destruct the props in the component. The alternative is to pass
// props inside a single object, like this: { message, isColorBlindMode }.
export const ChatMessage = (props) => {
  // Destructure the props.
  const { message, isColorBlindMode } = props;
  return (
    <>
      <span
        style={{
          fontWeight: "bold",
          color: isColorBlindMode ? undefined : message.user.color,
        }}
      >
        {message.user.userName}
      </span>{" "}
      <i>({message.time})</i>
      {": "}
      {message.body}
    </>
  );
};
