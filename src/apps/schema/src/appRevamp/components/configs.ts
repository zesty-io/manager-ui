interface FieldListData {
  type: string;
  name: string;
  shortDescription: string;
  description: string;
  commonUses: string[];
  proTip: string;
  subHeaderText: string;
}
const fields_list_config: { [key: string]: FieldListData[] } = {
  text: [
    {
      type: "text",
      name: "Single Line Text",
      shortDescription: "Titles, names, and headings",
      description:
        'The "Single Line Text" Field is best for short text content that doesn\'t need special formatting or have links or media.',
      commonUses: [
        "Article Titles",
        "Author Names",
        "Event Names",
        "Category Labels",
        "Headings",
      ],
      proTip:
        "This field works great when you want to ensure that contributors cannot apply any styling to text.",
      subHeaderText: "Used for Titles, names, and headings",
    },
    {
      type: "textarea",
      name: "Multi Line Text",
      shortDescription: "Descriptions, summaries, and blurbs",
      description:
        "The Multi Line Text field is best for long text content that doesn't need special formatting or have links or media.",
      commonUses: [
        "Sub Headings",
        "Article Summaries",
        "Product Descriptions",
        "Category Descriptions",
        "Author Bios",
      ],
      proTip:
        "This field works great when you want to ensure that contributors cannot apply any styling to text.",
      subHeaderText: "Used for descriptions, summaries, and blurbs",
    },
    {
      type: "wysiwyg_basic",
      name: "WYSIWYG",
      shortDescription: "Long text content with links & images such as blogs",
      description:
        "This field is best for long text content that has multiple headings, paragraphs, and in-line media such as videos, images, or links. You can also apply advanced text formatting such as bold, italics, and underline.",
      commonUses: [
        "Blog Posts",
        "Articles",
        "Guides",
        "Lists",
        "Event Descriptions",
      ],
      proTip:
        "This field works great when you want to contributors to apply any styling and structure to text.",
      subHeaderText: "Long text content with links & images such as blogs",
    },
    {
      type: "markdown",
      name: "Markdown",
      shortDescription: "Light weight markup to format text",
      description:
        "This field provides a contributor a Github Flavored Markdown editor syntax for styling and structuring content.",
      commonUses: [
        "Blog Posts",
        "Articles",
        "Guides",
        "Lists",
        "Event Descriptions",
      ],
      proTip:
        "This field works great when you want to contributors to apply any styling and structure to text.",
      subHeaderText: "Light weight markup to format text",
    },
  ],
  media: [
    {
      type: "images",
      name: "Media",
      shortDescription: "Images, videos, PDFs, and other files",
      description:
        "This field allows a user to add one or more media files such as an image, video, document, presentation, etc. You can set the maximum number of files a user can upload and the maximum file size for each upload.",
      commonUses: [
        "Article Cover Images",
        "Profile Pictures of Authors or Team Members",
        "Product Galleries",
        "Illustrations and Icons",
        "Videos of demos, tutorials, company onboarding",
        "Background Images",
        "PDFs of whitepapers, ebooks, menus, maps, and more",
        "Powerpoint Presentations",
      ],
      proTip: "You can also add media in-line in rich text fields.",
      subHeaderText: "Use for images, videos, PDFs, and other files",
    },
  ],
  relationship: [
    {
      type: "one_to_one",
      name: "One to One Relationship",
      shortDescription: "Link to one content item of a model",
      description:
        "This field is perfect for connecting your model to another model. For example, linking a blog to a category or an author.",
      commonUses: [
        "To link an Article to a single Author or Category",
        "To link an Employee to a single service",
      ],
      proTip:
        "It's great to use this field when you find yourself or your team repeatedly typing in the same set of inputs such as author names. For example, it makes sense to create a model of Authors and connect to it since you will else have to else repeatedly type it in for each article.",
      subHeaderText: "Use this field to link to one content item of a model",
    },
    {
      type: "one_to_many",
      name: "One to Many Relationship",
      shortDescription: "Link to multiple content items of a model",
      description:
        "This field allows you to connect your model to another model and connect to multiple items instead of one.",
      commonUses: [
        "To link an Article to Multiple Authors, Tags, or Categories",
        "To link an Author to Multiple Services",
      ],
      proTip:
        "It's great to use this field when you find yourself or your team repeatedly typing in the same set of inputs such as author names. For example, it makes sense to create a model of Authors and connect to it since you will else have to else repeatedly type it in for each article.",
      subHeaderText:
        "Use this field to link to multiple content items of a model",
    },
    {
      type: "link",
      name: "External URL",
      shortDescription: "Link to an external website",
      description:
        "This field is great to store URLs to pages on external websites. These links can be displayed and clicked on by users.",
      commonUses: [
        "Link to affiliate sites (e.g. Amazon)",
        "Link to Social Media Pages on Facebook, Instagram, etc.",
        "Link to 3rd party services like Eventbrite for events or Doordash for Orders",
      ],
      proTip: "You can also add links in rich text fields.",
      subHeaderText: "Use this field to link to an external website",
    },
    {
      type: "internal_link",
      name: "Internal Link",
      shortDescription: "Link to an internal content item",
      description:
        "Internal Link fields allow for the selection of an internal instance item from any schema. This can be useful for providing authors the ability to relate an item across an instance.",
      commonUses: ["Link to Internal Products", "Link to Internal Articles"],
      proTip:
        "You can use External URL fields if you want to link to external websites.",
      subHeaderText: "Use this field to link to an internal content item",
    },
  ],
  numeric: [
    {
      type: "number",
      name: "Integer",
      shortDescription: "Whole numbers",
      description: "This field is for when you want the input to be a number.",
      commonUses: [
        "Quantity of Products in Inventory",
        "Rankings",
        "Ratings",
        "Weight",
        "Height",
      ],
      proTip: "Number fields can hold both whole numbers and decimals.",
      subHeaderText: "Used for quantity, age, ratings, etc.",
    },
    {
      type: "currency",
      name: "Currency",
      shortDescription: "Perfect for product prices",
      description:
        "This field is for when you want to store a cost, price, or account balance.",
      commonUses: [
        "Cost Price of a Product or Service",
        "Selling Price of a Product or Service",
      ],
      proTip:
        "Use currency fields instead of number fields if you want to store prices.",
      subHeaderText: "Used for storing costs, prices, and balances",
    },
  ],
  dateandtime: [
    {
      type: "date",
      name: "Date",
      shortDescription: "Perfect for Birthdays, release dates, events, etc.",
      description: `This field is for when you want the input to be a past, present, or future date. You can customize whether a user can enter a day, month, or year or all 3.

      Zesty automatically tracks dates and times for date created, date published, and date modified so no additional fields need to be created for these.`,
      commonUses: [
        "Birthdates",
        "Anniversaries",
        "Historical Dates",
        "Release Dates",
      ],
      proTip:
        "If you want to add a time to your date then use the date time field.",
      subHeaderText: "Use for birthdays, release dates, events, etc.",
    },
    {
      type: "datetime",
      name: "Date & Time",
      shortDescription: "Track dates along with specific times",
      description: `This field is for when you want the input to be a data and time. You can customize whether a user can enter a time, day, month, or year or all 4. 

      Zesty automatically tracks dates and times for date created, date published, and date modified so no additional fields need to be created for these.`,
      commonUses: [
        "Event Start Times & End Times",
        "Shipment Time",
        "Deadlines",
      ],
      proTip: "If you want to only have a date then use the date field.",
      subHeaderText: "Use to track dates along with specific times",
    },
  ],
  options: [
    {
      type: "yes_no",
      name: "Boolean",
      shortDescription: "True or false",
      description:
        "This field is for when you want a field to only have two possible values. E.g. yes or no, true or false, featured or not featured, etc.",
      commonUses: [
        "To callout featured blog posts, products",
        "Discounts in e-commerce products",
        "To callout Badges such as “Pro Author”",
        "To hide items",
      ],
      proTip:
        "Use boolean fields to filter out items you want to show in a collection of items.",
      subHeaderText: "Used to set true or false values",
    },
    {
      type: "dropdown",
      name: "Dropdown",
      shortDescription: "Select from a list of values",
      description:
        "This field is for when you want a user to choose a value from a dropdown menu of pre-defined options written by you. You can define these values in the field settings.",
      commonUses: [
        "Genders",
        "Predefined Sizes",
        "Languages",
        "Company Departments",
      ],
      proTip:
        "The values you add to a dropdown field will only be available to the model the field is added into. If you need values that reusable and accessible in multiple models, create a separate model for it and then a single or multi item relationship field to it.",
      subHeaderText: "Used to allow a user to select from a list of values",
    },
    {
      type: "color",
      name: "Color",
      shortDescription: "Background colors, font colors, and more",
      description:
        "This field is perfect for when you want to style different elements on your page such as background colors, text colors, borders, etc. Contributors will be given a color picker to select a color of their choice.",
      commonUses: [
        "Background Colors",
        "Border Colors",
        "Font Colors",
        "Change Colors of Category Tags",
      ],
      proTip:
        "Color pickers can be used to call out items in a unique way and allow a user to easily differentiate between items.",
      subHeaderText: "Used for Background colors, font colors, and more",
    },
    {
      type: "sort",
      name: "Sort Order",
      shortDescription: "Add order to content items",
      // TODO: Details pending c/o Zosh
      description: "Lorem ipsum dolor sit amet consectetur adipisicing.",
      commonUses: ["test", "test"],
      proTip: "Lorem, ipsum.",
      subHeaderText: "Use to add order to content items",
    },
    {
      type: "uuid",
      name: "UUID",
      shortDescription: "Set unique ids to each content item",
      description:
        "The UUID field creates a unique alpha numeric string when an item is created. This is a helpful feature for analytics tracking, inventory management, user management, etc.",
      commonUses: ["Product ID", "Inventory ID", "Employee ID"],
      proTip: "UUID are always unique and are non editable.",
      subHeaderText: "Use to set unique ids to each content item",
    },
  ],
};

const TYPE_TEXT: { [key: string]: string } = {
  article_writer: "Article Writer",
  color: "Color",
  currency: "Currency",
  date: "Date",
  datetime: "Date and Time",
  dropdown: "Dropdown",
  files: "Files",
  font_awesome: "Font Awesome",
  images: "Media",
  internal_link: "Internal Link",
  link: "External URL",
  markdown: "Markdown",
  number: "Number",
  one_to_many: "One to Many",
  one_to_one: "One to One",
  sort: "Sort Order",
  text: "Single Line Text",
  textarea: "Multi Line Text",
  uuid: "UUID",
  wysiwyg_advanced: "WYSYWYG (Advanced)",
  wysiwyg_basic: "WYSIWYG",
  yes_no: "Boolean",
};

export { FieldListData, fields_list_config, TYPE_TEXT };
