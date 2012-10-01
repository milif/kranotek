(function(){
    App.defineView('ViewEditClassFieldPopup', {

        extend: 'Popup',

        model: App.getModel('ModelClassField'),

        init: function(){
            this.parent().init.apply(this, arguments);

        },
        doRender: function(){
            this.parent().doRender.apply(this, arguments);

            var self = this;

            var Form = App.getView('Form'),
                FieldTextarea = App.getView('FieldTextarea'),
                FieldText = App.getView('FieldText'),
                FieldSelect = App.getView('FieldSelect'),
                FieldCheckbox = App.getView('FieldCheckbox'),
                Button = App.getView('Button'),
                fieldWorkspaceId = new FieldText({
                    label: 'ID',
                    readonly: true,
                    name: 'id'
                }),
                fieldName = new FieldText({
                    label: 'Название',
                    name: 'Name'
                }),
                fieldDescription = new FieldTextarea({
                    label: 'Описание',
                    name: 'Description'
                }),
                fieldTypeDetails = new Button({
                    text: '...'
                }),
                fieldType = new FieldSelect({
                    label: 'Тип данных',
                    name: 'Type',
                    options: {
                        'null':'',
                        0:'Integer',
                        1:'Bigint',
                        2:'Smallint',
                        3:'Numeric',
                        4:'Boolean',
                        5:'Timestamp',
                        6:'Text',
                        7:'Subtype'
                    },
                    details: fieldTypeDetails
                }),
                fieldDefault = new FieldText({
                    label: 'По умолчанию',
                    name: 'Default'
                }),
                fieldUnique = new FieldCheckbox({
                    label: 'Уникальное',
                    name: 'Unique'
                }),
                fieldRequired = new FieldCheckbox({
                    label: 'Not null',
                    name: 'Required'
                }),
                form = new Form({
                    model: self.model,
                    listeners: {
                        'save': function(isNew){
                            var model = this.getModel();
                            self.trigger('save', model);
                        }
                    }
                })
                    .add(fieldName)
                    .add(fieldDescription)
                    .add(fieldType)
                    .add(fieldDefault)
                    .add(fieldUnique)
                    .add(fieldRequired)
                    .add(fieldWorkspaceId);

            fieldWorkspaceId.hide();

            this.add(form);

            this._form = form;

            this._fieldName = fieldName;
            this._fieldDescription = fieldDescription;
            this._fieldTypeDetails = fieldTypeDetails;
            this._fieldType = fieldType;
            this._fieldDefault = fieldDefault;
            this._fieldUnique = fieldUnique;
            this._fieldRequired = fieldRequired;

            fieldTypeDetails.hide();
            bindTypeDependencies.call(this);

            return this;
        },
        setModel: function(model) {
            this.setTitle(model ? ('Поле '+(model.get('Name') || '')) : 'Новое поле');
            model = model || new ModelClassField({});

            this.model = model;
            this._form.setModel(model);
            bindTypeDependencies.call(this);
        },
        close: function() {
            var self = this,
                close = this.parent().close;
            this._form.askIfDirty(function(){
                close.apply(self, arguments);
            });
            return self;
        }
    });

    var ModelClassField = App.getModel('ModelClassField');

    function showTypeDetails(mode) {
        if(!this._fieldTypeDetails) { return; }
        (mode) ? this._fieldTypeDetails.$el.show() : this._fieldTypeDetails.$el.hide();
    }

    function confirmClose() {
        var self = this;
        self._form.askIfDirty(function(){
            self.close();
        });
    }

    function bindTypeDependencies() {
        var self = this,
            subtypeValue = 7;
        var initType = parseInt(self._form._model.get('Type'), 10);
        showTypeDetails.call(this, initType === subtypeValue);
        this._form._model.on('change:Type', function(){
            var type = parseInt(self._form._model.get('Type'), 10);
            showTypeDetails.call(self, type === subtypeValue);
        });
    }
})();