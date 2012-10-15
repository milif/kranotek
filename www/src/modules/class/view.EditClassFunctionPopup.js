/*
 * @require modules/class/model.ClassFunction.js
 * @require view/Popup.js 
 * @require view/button/Button.js  
 * @require view/form/Form.js  
 * @require view/form/FieldTextarea.js 
 * @require view/form/FieldText.js  
 * @require view/form/FieldSelect.js   
 * @require view/form/FieldCheckbox.js    
 */
(function(){
    App.defineView('EditClassFunctionPopup', {

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
                fieldInfo = new FieldTextarea({
                    label: 'Описание',
                    name: 'Info'
                }),
                fieldType = new FieldSelect({
                    width: 175,
                    label: 'Тип',
                    name: 'Type',
                    options: App.getModel('ClassFunction').functionTypes
                }),
                fieldIsActive = new FieldCheckbox({
                    label: 'Активная',
                    name: 'isActive'
                }),
                fieldUseFields = new FieldCheckbox({
                    label: 'Использовать поля класса',
                    name: 'UseFields'
                }),
                form = new Form({
                    listeners: {
                        'save': function(isNew){
                            var model = this.getModel();
                            self.trigger('save', isNew, model);
                        }
                    }
                })
                    .add(fieldName)
                    .add(fieldInfo)
                    .add(fieldType)
                    .add(fieldIsActive)
                    .add(fieldUseFields)
                    .add(fieldWorkspaceId);

            fieldWorkspaceId.hide();

            this.add(form);

            this._form = form;

            this._fieldName = fieldName;
            this._fieldInfo = fieldInfo;
            this._fieldType = fieldType;
            this._fieldIsActive = fieldIsActive;
            this._fieldUseFields = fieldUseFields;

            this.setModel(this.model);

            return this;
        },
        setModel: function(model) {
            if(!model) return;
            this.setTitle(model.id ? ('Функция '+(model.get('Name') || '')) : 'Новая функция');

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
})();
