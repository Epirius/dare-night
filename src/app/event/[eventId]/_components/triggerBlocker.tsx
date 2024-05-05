import { type ReactNode, type SyntheticEvent } from "react";

const TriggerBlocker = ({ children }: { children: ReactNode }) => {
  const stopPropagation = (e: SyntheticEvent) => e.stopPropagation();
  return <div onClick={stopPropagation}>{children}</div>;
};
export default TriggerBlocker;
