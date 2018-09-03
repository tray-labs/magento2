define(
    [
        'underscore',
        'jquery',
        'ko',
        'Magento_Checkout/js/model/quote',
        'Magento_Catalog/js/price-utils',
        'Magento_Checkout/js/view/payment/default',
        'Magento_Checkout/js/action/place-order',
        'Magento_Checkout/js/action/select-payment-method',
        'Magento_Customer/js/model/customer',
        'Magento_Checkout/js/checkout-data',
        'Yapay_Magento2/js/model/credit-card-validation/credit-card-number-validator',
        'Yapay_Magento2/js/model/credit-card-validation/custom',
        'Magento_Payment/js/model/credit-card-validation/credit-card-data',
        'mage/translate'
    ],
    /**
     * Retorna metodos para view de checkout
     * @param _
     * @param $
     * @param ko
     * @param quote
     * @param priceUtils
     * @param Component
     * @param placeOrderAction
     * @param selectPaymentMethodAction
     * @param customer
     * @param checkoutData
     * @param cardNumberValidator
     * @param custom
     * @param creditCardData
     * @returns {*}
     */
    function (_,
              $,
              ko,
              quote,
              priceUtils,
              Component,
              placeOrderAction,
              selectPaymentMethodAction,
              customer,
              checkoutData,
              cardNumberValidator,
              custom,
              creditCardData
    ) {
        'use strict';


        return Component.extend({
            /**
             * Data model dos cartões
             */
            defaults: {
                template: 'Yapay_Magento2/payment/yapay_credit_card',
                creditCardType: '',
                creditCardExpYear: '',
                creditCardExpMonth: '',
                creditCardNumber: '',
                creditCardSsStartMonth: '',
                creditCardSsStartYear: '',
                creditCardVerificationNumber: '',
                selectedCardType: null,
                creditCardholder: '',
                creditCardSecurityCode: '',
                creditCardInstallments: '',
                creditCardCcTypes: '',
                creditCardAvailableTypes: '',
                creditCardPaymentId: ''
            },
            initObservable: function () {
                /**
                 * Observador dos data models
                 */
                this._super()
                    .observe([
                        'creditCardType',
                        'creditCardExpYear',
                        'creditCardExpMonth',
                        'creditCardNumber',
                        'creditCardVerificationNumber',
                        'creditCardSsStartMonth',
                        'creditCardSsStartYear',
                        'selectedCardType',
                        'creditCardholder',
                        'creditCardSecurityCode',
                        'creditCardInstallments',
                        'creditCardCcTypes',
                        'creditCardAvailableTypes',
                        'creditCardPaymentId'
                    ]);
                return this;
            },

            /**
             * Retorna o tipo de pagamento disponivel
             * @returns {string}
             */
            getCode: function() {
                return 'yapay_credit_card';
            },

            /**
             * Construtor do yapay_credit_card-method
             */
            initialize: function() {
                var self = this;
                this._super();

                //Set credit card number to credit card data object
                this.creditCardNumber.subscribe(function(value) {
                    var result;
                    self.selectedCardType(null);
                    if (value == '' || value == null) {
                        return false;
                    }

                    result = cardNumberValidator(value);

                    if (!result.isPotentiallyValid && !result.isValid) {
                        return false;
                    }

                    if (result.card !== null) {
                        self.selectedCardType(result.card.title.toLowerCase());
                        creditCardData.creditCard = result.card;
                    }

                    if (result.isValid) {
                        creditCardData.creditCardNumber = value;
                        self.creditCardType(result.card.type);
                        self.creditCardPaymentId(result.card.payment_id)
                    }
                });

                //Set expiration year to credit card data object
                this.creditCardExpYear.subscribe(function(value) {
                    creditCardData.expirationYear = value;
                });

                //Set expiration month to credit card data object
                this.creditCardExpMonth.subscribe(function(value) {
                    creditCardData.expirationYear = value;
                });

                //Set cvv code to credit card data object
                this.creditCardVerificationNumber.subscribe(function(value) {
                    creditCardData.cvvCode = value;
                });
            },

            /**
             * Retorna que elemento esta ativo
             * @returns {boolean}
             */
            isActive: function () {
                return true;
            },

            /**
             * Verifica ativação do parcelamento caso a bandeira permita
             * @returns {boolean}
             */
            isActiveSplit: function () {
                return this.creditCardPaymentId() !== '19';

            },

            /**
             * Retorna as imagens das bandeiras dos cartões
             *
             * @param type
             * @returns {boolean}
             */
            getIcons: function (type) {
                return window.checkoutConfig.payment.yapay_credit_card.icons.hasOwnProperty(type.toLowerCase()) ?
                    window.checkoutConfig.payment.yapay_credit_card.icons[type.toLowerCase()]
                    : false;
            },

            /**
             * Busca as bandeiras disponiveis
             * @returns {*}
             */
            getCcAvailableTypes: function() {
                return window.checkoutConfig.payment.yapay_credit_card.availableTypes;
            },

            /**
             * Buscas meses
             * @returns {*}
             */
            getCcMonths: function() {
                var months = {
                    1 : "01 - Janeiro",
                    2 : "02 - Fevereiro",
                    3 : "03 - Março",
                    4 : "04 - Abril",
                    5 : "05 - Maio",
                    6 : "06 - Junho",
                    7 : "07 - Julho",
                    8 : "08 - Agosto",
                    9 : "09 - Setembro",
                    10 : "10 - Outubro",
                    11 : "11 - Novembro",
                    12 : "12 - Dezembro"
                };
                return months;
            },

            /**
             * Buscas os anos
             * @returns {*}
             */
            getCcYears: function() {
                return window.checkoutConfig.payment.yapay_credit_card.years['yapay_credit_card'];
            },


            hasVerification: function() {
                return window.checkoutConfig.payment.yapay_credit_card.hasVerification['yapay_credit_card'];
            },

            /**
             * Busca a quantidade de parcelas sem juros
             *
             * @returns {*}
             */
            // getInterestFreeInstallments: function() {
            //     return window.checkoutConfig.payment.yapay_credit_card.interestFreeInstallments;
            // },

            /**
             * Busca os juros de cada parcela
             *
             * @returns {*}
             */
            getInterestInstallments: function() {
                return window.checkoutConfig.payment.yapay_credit_card.interestInstallments;
            },

            /**
             * Busca parcelas disponiveis
             *
             * @returns {Document.installments}
             */
            getInstallments: function() {
                return window.checkoutConfig.payment.yapay_credit_card.installments;
            },

            /**
             * Retorna as bandeiras disponiveis
             *
             * @returns {Array}
             */
            getCcAvailableTypesValues: function() {
                var cards = this.getCcAvailableTypes();
                var cardsArray = [];
                for(var i=0; i < cards.length; i++) {
                    Object.keys(cards[i]).map(function(key, index) {
                        cardsArray[i] = {"value":key, "card": cards[i][key].toLowerCase()}
                    })
                }
                return cardsArray;
            },

            /**
             * Retorna meses
             *
             * @returns {*}
             */
            getCcMonthsValues: function() {
                return _.map(this.getCcMonths(), function(value, key) {
                    return {
                        'value': key,
                        'month': value
                    }
                });
            },

            /**
             * Retorna os Anos
             *
             * @returns {*}
             */
            getCcYearsValues: function() {
                return _.map(this.getCcYears(), function(value, key) {
                    return {
                        'value': key,
                        'year': value
                    }
                });
            },


            /**
             * Retorna a quantidade parcelas sem juros para view
             *
             * @returns {*}
             */
            // getInterestFreeInstallmentsValues: function () {
            //     console.log(this.getInterestFreeInstallments())
            //     return this.getInterestFreeInstallments()
            // },

            getInterestInstallmentsValues: function () {
                return this.getInterestInstallments()
            },
            /**
             * Retorna as pacelas disponiveis
             *
             * @returns {*}
             */
            getInstallmentsValues: function () {
                var $installmentArray = [];
                for (var i=0; i < this.getInstallments(); i++ ) {
                    $installmentArray[i] = i+1;
                }

                return _.map(this.getInterestInstallmentsValues(), function(value, key) {
                    return {
                        'value': key + 1,
                        'installment': value
                    }
                });
            },


            /**
             * Retorna CPF do cliente
             * @returns {*}
             */
            getCpfCustomer: function () {
                if(checkoutData.getShippingAddressFromData() != null) {
                    if (checkoutData.getShippingAddressFromData().custom_attributes != undefined) {
                        return checkoutData.getShippingAddressFromData().custom_attributes.cpf_customer;
                    }
                }
                return '';
            },

            /**
             * Retorna CNPJ do cliente
             * @returns {*}
             */
            getCnpjCustomer: function () {
                if(checkoutData.getShippingAddressFromData() != null) {
                    if (checkoutData.getShippingAddressFromData().custom_attributes != undefined) {
                        return checkoutData.getShippingAddressFromData().custom_attributes.cnpj_customer;
                    }
                }
                return '';
            },

            /**
             * Envia request com os dados do cartão
             * @returns {{method: *, additional_data: {cc_number: *, cc_card: *, cc_exp_month: *, cc_exp_year: *, cc_cardholder: *, cc_installments: *, cc_security_code: *}}}
             */
            getData: function () {
                return {
                    'method': this.item.method,
                    'additional_data': {
                        'cc_number': this.creditCardNumber(),
                        'cc_card': this.creditCardPaymentId(),
                        'cc_exp_month': this.creditCardExpMonth(),
                        'cc_exp_year': this.creditCardExpYear(),
                        'cc_cardholder': jQuery('#'+this.getCode()+'_cc_cardholder').val(),
                        'cc_installments': jQuery('#'+this.getCode()+'cc_installments').val(),
                        'cc_security_code': jQuery('#'+this.getCode()+'cc_security_code').val(),
                        'cpfCustomer': this.getCpfCustomer(),
                        'cnpjCustomer': this.getCnpjCustomer()
                    }
                };
            },

            /**
             * Fecha a ordem
             * @param self
             * @param paymentData
             * @param messageContainer
             * @param pagseguroHash
             */
            finishOrder: function(self, paymentData, messageContainer, pagseguroHash) {
                console.log('oi sou finish Order');

            },

            /**
             * Chama os metodos de validação
             * @returns {*}
             */
            validate: function() {
                var $form = $('#' + this.getCode() + '-form');
                return $form.validation() && $form.validation('isValid');
            }

        });
    }
);
