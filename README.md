![Adventure Time Jiggler](http://i.imgur.com/XUI33tj.gif)

*The Jiggler is © 2012 Cartoon Network*

node-jiggler (as forked by hilkeheremans)
==============

Jiggler provides a simple and flexible interface for defining representations for your JavaScript objects. This allows for
separating the concern of how models are used and stored in your application layer with how they are presented to endpoints such
as REST API clients.

Jiggler is framework agnostic and works with any object oriented approach to model declaration.
We use it in production at [Heyride](http://heyride.com) for serializing all of our REST API responses which are derived from
Mongoose objects.

It is loosely based on the ruby [acts_as_api](https://github.com/fabrik42/acts_as_api) gem and [node-swiz](https://github.com/racker/node-swiz),
the latter not providing enough flexibility for our required use cases.

This package does not handle serialization of object representations. The most common use case is to produce a JSON string
from a representation and this is easily done with a single call to JSON.stringify(). It would be fairly straightforward to
add support for serializers (including XML). We welcome pull requests.

## Changes in this fork
* Jiggler now stores its templates a little differently. It is now possible to store templates using a path instead of just a template name
* Paths are stored using the usual dot notation.
* Template retrieval, when called with J.templatesWildcard instead of J.templates, also supports wildcard notation, as defined in J.wildcard. This defaults to *. Exact matches trump wildcard matches.
* Tests have been updated accordingly.
* WARNING: unfortunately, this also breaks Jiggler's API. Instead of calling J.template[key] and J.as[key] you must now call J.template(path) and J.as(path, value) (function calls instead of accessors).
* WARNING: The implementation relies on lodash's set function, which seems to have a bug/design choice that causes problems when you use numbers in a path segment. Ie do not use this.is.path.1, use this.is.path._1 instead.

### Example of change in fork
```javascript

var J = require('jiggler');

// define v1 for public blog representation
J.define('blog.public.v1', [
    J.Field('_id'),
    J.Field('title'),
    J.Field('author'),
    J.Field('comments'),
    J.Field('hidden', {
    	formatter: function(value) {
    		return value ? 'yes' : 'no';
    	}
    })
    
// define all other blog representations for v1 (eg private, admin, whatever)
J.define('blog.*.v1', [
    J.Field('_id'),
    J.Field('title'),
    J.Field('author'),
    J.Field('comments'),
    J.Field('hidden', {
        formatter: function(value) {
            return value ? 'yes' : 'no';
        }
    })
        
// retrieve blog implementations
J.templates('blog.public.v1') 
// returns blog.public.v1 template

J.templates('blog.private.v1') 
// throws error: cannot find this template
// reason: J.templates does NOT match wildcards

J.templatesWildcard('blog.private.v1')
// returns blog.*.v1 template

```


## Example

Let’s use the [Mongoose Blog Schema](http://mongoosejs.com) definition as an example:

```javascript
var blogSchema = new Schema({
  title:  String,
  author: String,
  body:   String,
  comments: [{ body: String, date: Date }],
  date: { type: Date, default: Date.now },
  hidden: Boolean,
  meta: {
    votes: Number,
    favs:  Number
  }
});
var Blog = mongoose.model('Blog', blogSchema);
```

Let’s define a representation that formats blog objects for API consumption. Only fields specifically defined in a template will be rendered. In addition, you can provide a value formatter function to manipulate values prior to their inclusion in the serialized response:

```javascript
var J = require('jiggler');

J.define('blog_public', [
    J.Field('_id'),
    J.Field('title'),
    J.Field('author'),
    J.Field('comments'),
    J.Field('hidden', {
    	formatter: function(value) {
    		return value ? 'yes' : 'no';
    	}
    })
```

Now we can render a representation of a blog object (or an array of blog objects) using this template:

```javascript
// Create the blog instance
var post = new Blog({
	title: 'A Song of Ice and Fire',
	author: 'George R. R. Martin',
	comments: [{
		body: 'I love this one!',
		date: new Date()
	}],
	hidden: false,
	meta: {
		votes: 22,
		favs: 12
	}
});

// Apply the representation template
J.as.blog_public(post, {}, function(err, rep) {
	console.log(rep);
});

// Or represent an array of posts
J.as.blog_public([post, post], {}, function(err, rep) {
	console.log(rep);
})

```

### Output

```javascript
{
	_id: "12345",
	title: "A Song of Ice and Fire",
	author: "George R. R. Martin",
	comments: [
		{
			body: "I love this one!",
			date: Tue Dec 18 2012 15:14:34 GMT-0600 (CST)
		}
	],
	hidden: "no"
}

[
	{
		_id: "12345",
		title: "A Song of Ice and Fire",
		author: "George R. R. Martin",
		comments: [
			{
				body: "I love this one!",
				date: Tue Dec 18 2012 15:14:34 GMT-0600 (CST)
			}
		],
		hidden: "no"
	},
	{
		_id: "12345",
		title: "A Song of Ice and Fire",
		author: "George R. R. Martin",
		comments: [
			{
				body: "I love this one!",
				date: Tue Dec 18 2012 15:14:34 GMT-0600 (CST)
			}
		],
		hidden: "no"
	}
]
```

## Registering Templates

Templates are registered using the ```define``` method. You must provide a name for the template and an array of field definitions. 
Simple template inheritence is allowed by passing an options hash including a key of extends and a value which is the name of a previously defined template:

```javascript
J.define('blog_private', [
    	J.Field('privateNotes'),
    ], 
    {extends: 'blog_public'}
);
```

If a field is redefined in an extension template, the most inherited version of the field will be used.

## Field Definitions

Field definitions are defined using the Field factory provided when requiring jiggler. In all examples we have referenced this factory as ```J.Field```.

Fields require a name and a variety of options may also be specified to control representation output including attaching virtual properties and formatted properties:

```javascript

// Include the source key 'fieldName' in the representation object
J.Field('fieldName')

// Include the source key 'anObject' and represent it using the template 'a_template'
J.Field('anObject', {template: 'a_template'})

// Include the source key 'firstName' and format the value using the provided function
J.Field('firstName', {
	formatter: function(value) {
		return value.charAt(0);
	}
})

// Include a represented key 'relationship' and populate it using the specified function
// The complete source object and a representation context is passed 
J.Field('relationship', {
	src: function(object, context, callback) {
		callback(null, 'friend')
	}
})

```

See the unit tests for additional examples.


## License

The MIT License (MIT) Copyright (c) 2012 Brian Romanko.

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
