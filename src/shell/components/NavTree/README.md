The `Nav` component will receive the following props.

`actions`
An array of objects that can be configurable from the client of the following structure:

```
const actions = [
    {
        icon: '',          // class of font-awesome icon
        onClick: func,     // function to trigger when clicking the icon. All nav item props are passed back to the function.
        available: func,  // Function. determines if action is shown, defaults to true. All nav item props are passed back to the function.
        showIcon: // Boolean. Specifics whether an action should always be displayed. Default, false, behavior is to show on hover.
        styles: { }        // styles object passed to the action icon.
    }
]
```

`handleOpen`
Function to handle interaction when clicking on nav item.

`tree`
Array of objects used to build the Nav Tree
