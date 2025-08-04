# Pretty properties

This plugin makes metadata block on the top of the file more visually appealing with images and colors.

![book note](images/image-1.png)

## Features

### Cover image

Add image to the left of metadata block to save space in the note. Works great for book notes, people profiles etc. You can change the shape and size of the image using cssclasses.

To add image put image link into the "cover" property (must be of type "text"). You can use embeds,  wikilinks, markdown links or bare urls for external images. 

Add cssclasses to the note to change the shape of the image. Currently supported classes are "cover-vertical", "cover-horizontal", "cover-square" and "cover-circle". 

You can right-click on existing cover or call command to open menu to change image or cover shape. 

![person profile note](images/image-2.png)

### Banner

You can add simple banners to your notes. To do so add the link to the "banner" property the same way as with cover. 

![note with banner](images/image-3.png)

You can right-click on existing banner or call command to open menu to select banner image.

### Icon

You can add icons alongside tha banner or just on their own. To do this add a link or some text to the "icon" property. For the icon ou can use images, built-in Lucide icons or any symbols, including emoji:
- add internal or external link to add image;
- add the name of lucide icon, for example "star", to add svg icon;
- if you add any other text, the first symbol will be shown as icon.

![base](images/image_icon.png)

You can right-click on existing icon or call command to open icon suggestion menu.

### Hide properties

If you have many properties in the note, you may want to hide some of them while keeping the others visible. This plugin makes it easy. Click on the property icon and select "Hide property" in menu. If you want to see it again, run command "Toggle reveal / hide all hidden properties". After that you will see the hidden properties and can mark them as not hidden.

![property menu with hide option](images/image-4.png)

### Colorful list properties

You can make you list properties stand out by assigning each item their own color. Right-click on the item pill to select color. You can also chose "none" to make the pill background transparent or reset it to default. Only basic theme colors are supported for now.

![property color menu](images/image-5.png)

You can also add you own styling to the list properties. Each of them (even not colored ones) will get attribute "data-property-pill-value" containing actual value of item. You can use these attributes to write you own css for any individual item like this:

```
[data-property-pill-value="my-property-value"] {
    /* my styles */
}
```

### Progress bars

Add simple progress bar to any number property. By default maximum value of progress bar is 100 and property value is treated as percent. If you want to add custom number as progress maximum, you need to add additional number property to the note and in the first property menu select the option "Set max progress from another property".

![progress bar](images/image-6.png)

### Sync tasks count to properties

If you set special properties for tasks, completed tasks and uncompleted tasks and add this properties to your note, the plugin will count existing tasks in the active note and periodically save the count number to the properties. It is useful if you want to show task count in Bases or see task progress inside your note.

### Property search

If you Ctrl+click on any property value, the plugin will open search for this value in the search tab (works only on desktop). If the property value is a link you should click outside the link.

![base](images/image_search.png)

## Bases support (experimental)

Bases are still in beta, so this functional may change. This functional is still fragile and can have bugs.

![base](images/image_base.png)

When bases support option is enabled, properties colors would also shown in bases. They work the same way as in files.

Unfortunately currently there is no way to properly add progress bars to base properties directly, but there is a workaround using formulas:

1. Create formula property with a name starting with "pp_progress" (you can later change the display name to anything you want).
2. Add the formula that will result in string containing og two digits parted by slash, like "5/10". For example, if you have two number properties "max" and "value", you can use a formula like this: 
```
if(note["max"], if(note["value"], note["value"], 0) + "/" + note["max"], " ")
```
3. If everything is done correctly, formula cells will render as progress bars.

## Installation

Untill this plugin is made availiable in the official plugins menu it can be insalled via BRAT:

1. Install the BRAT plugin from "Community plugins" page.
2. Go to the BRAT settings.
3. Click "Add Beta Plugin" button.
4. Paste the following URL in the text field: https://github.com/anareaty/pretty-properties.
5. Select the latest release.
6. Make sure that "Enable after installing the plugin" is checked.
7. Click "Add Plugin" button.

## Acknowledgments

This plugin uses a bit of code from the [Iconic plugin](https://github.com/gfxholo/iconic) to be able to add new items to menus. 