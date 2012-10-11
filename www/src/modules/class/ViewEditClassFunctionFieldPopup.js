(function(){
    App.defineView('ViewEditClassFunctionFieldPopup', {

        extend: 'Popup',

        options: {
            popupWidth: 500
        },

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
                ContainerRow = App.getView('ContainerRow'),
                Button = App.getView('Button'),
                fieldWorkspaceId = new FieldText({
                    label: 'ID',
                    readonly: true,
                    name: 'id'
                }),
                fieldIsConfigurable = new FieldCheckbox({
                    label: 'Настраеваемое поле',
                    name: 'isConfigurable'
                }),
                fieldName = new FieldText({
                    label: 'Название',
                    name: 'Name'
                }),
                fieldInfo = new FieldTextarea({
                    label: 'Описание',
                    name: 'Info'
                }),
                fieldType = new FieldSelect({
                    width: 175,
                    label: 'Тип',
                    name: 'Datatype',
                    options: App.getModel('ClassFunctionField').fieldTypes
                }),
                fieldIsNull = new FieldCheckbox({
                    label: 'Запрет null',
                    name: 'isNull'
                }),
                fieldIsArray = new FieldCheckbox({
                    label: 'Масив',
                    name: 'isArray'
                }),
                fieldArray = new FieldText({                 
                    name: 'Array',
                    hideLabel: true
                }),
                containerArray = new ContainerRow({
                })
                    .add(fieldIsArray, 6)
                    .add(fieldArray, 5),
                form = new Form({
                    listeners: {
                        'save': function(isNew){
                            var model = this.getModel();
                            self.trigger('save', isNew, model);
                        }
                    }
                })
                    .add(fieldIsConfigurable)
                    .add(fieldName)
                    .add(fieldInfo)
                    .add(fieldType)
                    .add(fieldIsNull)
                    .add(containerArray)
                    .add(fieldWorkspaceId);

            fieldWorkspaceId.hide();

            this.add(form);

            fieldIsArray.on('change', function(){
                syncCheckboxText.call(this, fieldIsArray, fieldArray);
            });
            syncCheckboxText.call(this, fieldIsArray, fieldArray);

            this._form = form;

            this._fieldIsConfigurable = fieldIsConfigurable;
            this._fieldName = fieldName;
            this._fieldInfo = fieldInfo;
            this._fieldType = fieldType;
            this._fieldIsNull = fieldIsNull;
            this._fieldArray = fieldArray;

            this.setModel(this.model);

            return this;
        },
        setModel: function(model) {
            if(!model) return;
            this.setTitle(model.id ? ('Поле '+(model.get('Name') || '')) : 'Новое поле');
            model = model || new ModelClassField({});

            this.model = model;
            this._form.setModel(model);
            
            return this;
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

    function showTypeDetails(mode) {
        if(!this._fieldTypeDetails) { return; }
        (mode) ? this._fieldTypeDetails.show() : this._fieldTypeDetails.hide();
    }

    function confirmClose() {
        var self = this;
        self._form.askIfDirty(function(){
            self.close();
        });
    }

    function syncCheckboxText(fieldIsArray, fieldArray) {
        var isChecked = fieldIsArray.getValue();
        (isChecked) ? fieldArray.setReadOnly() : fieldArray.setReadOnly(true);
    }
})();
