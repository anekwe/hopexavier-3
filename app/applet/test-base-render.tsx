import * as React from 'react';
import { renderToString } from 'react-dom/server';
import { Dialog as DialogPrimitive } from '@base-ui/react/dialog';

const App = () => {
    return React.createElement(DialogPrimitive.Root, null,
        React.createElement(DialogPrimitive.Trigger, { render: React.createElement("div", {className: 'my-div'}, "Hello") })
    );
};

console.log(renderToString(React.createElement(App)));
