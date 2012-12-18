node-jiggler
==============

![Adventure Time Jiggler](http://a3094b75ef3de92d2032-5e0efc983ceed99b1f53c92d149fb2f5.r69.cf1.rackcdn.com/jiggler.gif)

jiggler provides a simple and flexible interface for creating serializable representations for your JavaScript objects.

This is incredibly useful for REST API responses that need to transform and sanitize responses sent to clients. Rather than
passing replacer methods to JSON.stringify or overloading the Mongoose toObject method you can define a more readable and flexible serialization templates.

We use it in production at [Heyride](http://heyride.com) for serializing all of our REST API responses.

It is loosely based on the ruby [acts_as_api](https://github.com/fabrik42/acts_as_api) gem and [node-swiz](https://github.com/racker/node-swiz),
the latter not providing enough flexibility for our required use cases.

## Example

Let’s use the [Mongoose Blog Schema](http://mongoosejs.com) definition as an example:

```
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

Let’s define a representation that formats blog objects for API consumption:

```
var J = require('jiggler');

J.define(Blog, 'public', [
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
Only fields specifically defined in a template will be rendered. In addition, you can provide a value formatter function to manipulate values prior to their inclusion in the serialized response:

### Output

```
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
```
