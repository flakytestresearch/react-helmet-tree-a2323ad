import React, { FunctionComponent, useContext, useReducer } from "react";
import {
  mapStateOnServer,
  reducePropsToState,
  handleClientStateChange,
} from "./HelmetUtils";

export const defaultHelmetState = mapStateOnServer({
  baseTag: [],
  bodyAttributes: {},
  encodeSpecialCharacters: true,
  htmlAttributes: {},
  linkTags: [],
  metaTags: [],
  noscriptTags: [],
  scriptTags: [],
  styleTags: [],
  title: "",
  titleAttributes: {},
});

type Action = {
  type: "add" | "remove";
  instance: any;
};
type Dispatch = (action: Action) => void;
type State = Array<typeof defaultHelmetState>;
const HelmetStateContext = React.createContext<State | undefined>(undefined);
const HelmetDispatchContext = React.createContext<Dispatch | undefined>(
  undefined
);

function emitChange(helmetInstances: State) {
  const state = reducePropsToState(helmetInstances);
  console.log("state?", state);
  if (HelmetProvider.canUseDOM) {
    handleClientStateChange(state);
  }
}

function helmetReducer(helmetInstances: State, action: Action) {
  switch (action.type) {
    case "add": {
      const augmentedState = [...helmetInstances, action.instance];
      emitChange(augmentedState);
      return augmentedState;
    }
    case "remove": {
      const index = helmetInstances.indexOf(action.instance);
      helmetInstances.splice(index, 1);

      return [...helmetInstances];
    }
    default: {
      throw new Error(`Unhandled action type: ${action.type}`);
    }
  }
}

export const HelmetProvider: FunctionComponent & { canUseDOM: boolean } = ({
  children,
}) => {
  const [helmetState, dispatch] = useReducer(helmetReducer, []);
  console.log("helmetState?", helmetState);

  return (
    <HelmetStateContext.Provider value={helmetState}>
      <HelmetDispatchContext.Provider value={dispatch}>
        {children}
      </HelmetDispatchContext.Provider>
    </HelmetStateContext.Provider>
  );
};

HelmetProvider.canUseDOM = !!(
  typeof window !== "undefined" &&
  window.document &&
  window.document.createElement
);

export function useHelmetState() {
  const context = useContext(HelmetStateContext);

  if (context === undefined) {
    throw new Error("useHelmetState must be used within a <HelmetProvider>");
  }

  return context;
}

export function useHelmetDispatch() {
  const context = useContext(HelmetDispatchContext);

  if (context === undefined) {
    throw new Error("useHelmetDispatch must be used within a <HelmetProvider>");
  }

  return context;
}

export function useHelmet() {
  return [useHelmetState(), useHelmetDispatch()] as const;
}