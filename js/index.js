var Modal = ReactBootstrap.Modal;
var Button = ReactBootstrap.Button;
var ButtonToolbar = ReactBootstrap.ButtonToolbar;
var Input = ReactBootstrap.Input;

var saveData = function saveData(recipes) {
	if (typeof Storage !== "undefined") {
		localStorage.setItem("recipes", JSON.stringify(recipes).toString());
	}
};

var loadData = function loadData() {
	if (typeof Storage !== "undefined") {
		return JSON.parse(localStorage.getItem("recipes"));
	}
};

var RecipeItem = React.createClass({
	displayName: "RecipeItem",

	handleClick: function handleClick(e) {
		var el = this.refs.wrapper;

		if (this.state.open) {
			this.setState({
				open: false,
				class: "accordion-closed"
			});
			el.style.height = getComputedStyle(el).height;
			el.offsetHeight;
			el.style.height = 0;
		} else {
			this.setState({
				open: true,
				class: "accordion-open"
			});
			var prev = el.style.height;
			el.style.height = "auto";
			var next = getComputedStyle(el).height;
			el.style.height = prev;
			el.offsetHeight;
			el.style.height = next;
			el.addEventListener("transitionend", function onTransitionEnd() {
				el.style.height = "auto";
				el.removeEventListener("transitionend", onTransitionEnd, false);
			}, false);
		}
	},

	handleEdit: function handleEdit() {
		this.props.onEdit(this.props.index);
	},

	handleDelete: function handleDelete() {
		this.props.onDelete(this.props.index);
	},

	getInitialState: function getInitialState() {
		return {
			open: false,
			class: "accordion-closed"
		};
	},

	componentDidMount: function componentDidMount() {
		var el = this.refs.wrapper;
		el.style.height = 0;
	},

	render: function render() {
		var classname = "panel panel-primary " + this.state.class;
		var ingredients = this.props.ingredients.map(function (item) {
			return React.createElement(
				"li",
				{ className: "list-group-item", key: item },
				item
			);
		});

		return React.createElement(
			"div",
			{ className: "recipeItem" },
			React.createElement(
				"div",
				{ className: classname },
				React.createElement(
					"div",
					{ className: "panel-heading", onClick: this.handleClick },
					React.createElement(
						"h4",
						{ className: "panel-title" },
						this.props.title
					)
				),
				React.createElement(
					"div",
					{ className: "panel-wrap", ref: "wrapper" },
					React.createElement(
						"div",
						{ className: "panel-body" },
						React.createElement(
							"h4",
							null,
							"Ingredients"
						),
						React.createElement(
							"ul",
							{ className: "list-group" },
							ingredients
						),
						React.createElement(
							ButtonToolbar,
							null,
							React.createElement(
								"button",
								{ className: "btn btn-danger", onClick: this.handleDelete },
								"Delete"
							),
							React.createElement(
								"button",
								{ className: "btn btn-default", onClick: this.handleEdit },
								"Edit"
							)
						)
					)
				)
			)
		);
	}
});

var RecipeList = React.createClass({
	displayName: "RecipeList",


	render: function render() {
		var self = this;
		var recipes = this.props.recipes.map(function (recipe, idx) {
			return React.createElement(RecipeItem, { key: idx, index: idx, title: recipe.title, ingredients: recipe.ingredients, onEdit: self.props.onEdit, onDelete: self.props.onDelete });
		});
		return React.createElement(
			"div",
			{ className: "recipeList" },
			React.createElement(
				"div",
				{ className: "panel-group", id: "accordion" },
				recipes
			)
		);
	}
});

var recipe = function recipe(title, ingredients) {
	this.title = title;
	this.ingredients = ingredients;
};

var RecipeModal = React.createClass({
	displayName: "RecipeModal",


	handleAdd: function handleAdd() {
		var title = this.refs.title.getValue();
		var ingredients = this.refs.ingredients.getValue();
		if (title && ingredients) {
			var newrecipe = new recipe(title, ingredients.split(','));
			this.props.addRecipe(newrecipe);
		}
	},

	handleEdit: function handleEdit() {
		var title = this.refs.title.getValue();
		var ingredients = this.refs.ingredients.getValue();
		if (title && ingredients) {
			this.props.recipe.title = title;
			this.props.recipe.ingredients = ingredients.split(',');
			this.props.editRecipe();
		}
	},

	render: function render() {
		var saveButton = this.props.status === "add" ? React.createElement(
			Button,
			{ bsStyle: "primary", onClick: this.handleAdd },
			"Add Recipe"
		) : React.createElement(
			Button,
			{ bsStyle: "primary", onClick: this.handleEdit },
			"Edit Recipe"
		);

		var titleText = this.props.status === "add" ? "" : this.props.recipe.title;

		var ingredientsText = this.props.status === "add" ? "" : this.props.recipe.ingredients.toString();

		return React.createElement(
			Modal,
			{ show: this.props.show, onHide: this.props.onHide },
			React.createElement(
				Modal.Header,
				{ closeButton: true },
				React.createElement(
					Modal.Title,
					null,
					"Recipe"
				)
			),
			React.createElement(
				Modal.Body,
				null,
				React.createElement(Input, {
					type: "text",
					label: "Title",
					placeholder: "enter title",
					ref: "title",
					defaultValue: titleText
				}),
				React.createElement(Input, {
					type: "text",
					label: "Ingredients",
					help: "comma (,) separated items",
					placeholder: "enter ingredients",
					ref: "ingredients",
					defaultValue: ingredientsText
				})
			),
			React.createElement(
				Modal.Footer,
				null,
				React.createElement(
					ButtonToolbar,
					null,
					saveButton,
					React.createElement(
						Button,
						{ onClick: this.props.onHide },
						"Close"
					)
				)
			)
		);
	}
});

var RecipeContainer = React.createClass({
	displayName: "RecipeContainer",


	getInitialState: function getInitialState() {
		var rec = loadData();
		if (rec == null) rec = [new recipe("Pie", ["Crust", "Fillings"])];
		return { recipes: rec,
			showModal: false,
			editIdx: -1
		};
	},

	close: function close() {
		this.setState({ showModal: false });
	},

	open: function open() {
		this.setState({ showModal: true });
	},

	addRecipe: function addRecipe(newrecipe) {
		this.state.recipes.push(newrecipe);
		this.setState({ recipes: this.state.recipes, showModal: false });
		saveData(this.state.recipes);
	},

	editRecipe: function editRecipe() {
		this.setState({ showModal: false, editIdx: -1 });
		saveData(this.state.recipes);
	},

	handleEdit: function handleEdit(index) {
		this.setState({ editIdx: index, showModal: true });
	},

	handleDelete: function handleDelete(index) {
		this.state.recipes.splice(index, 1);
		this.setState({ recipes: this.state.recipes });
		saveData(this.state.recipes);
	},

	render: function render() {
		var modal = this.state.editIdx === -1 ? React.createElement(RecipeModal, { status: "add", show: this.state.showModal, onHide: this.close, addRecipe: this.addRecipe }) : React.createElement(RecipeModal, {
			status: "edit", show: this.state.showModal,
			onHide: this.close, editRecipe: this.editRecipe,
			recipe: this.state.recipes[this.state.editIdx]
		});

		return React.createElement(
			"div",
			{ className: "container" },
			React.createElement(
				"h3",
				null,
				"Recipe Box"
			),
			React.createElement(
				"div",
				{ className: "well" },
				React.createElement(RecipeList, { recipes: this.state.recipes, onEdit: this.handleEdit, onDelete: this.handleDelete })
			),
			React.createElement(
				Button,
				{ bsStyle: "primary", onClick: this.open },
				"Add Recipe"
			),
			modal
		);
	}
});

ReactDOM.render(React.createElement(RecipeContainer, null), document.getElementById('react-container'));