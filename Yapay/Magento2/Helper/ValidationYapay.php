<?php
/**
 * Created by PhpStorm.
 * User: matheus
 * Date: 25/06/18
 * Time: 15:08
 */

namespace Yapay\Magento2\Helper;


use Magento\Framework\Exception\ValidatorException;
use Magento\Framework\Phrase;

class ValidationYapay extends \Magento\Framework\App\Helper\AbstractHelper
{

    const JCB_PAYMENT_METHOD = 19;

    /**
     * @var \Magento\Framework\App\Config\ScopeConfigInterface
     */
    protected $_scopeConfig;


    /**
     * ValidationYapay constructor.
     * @param \Magento\Framework\App\Config\ScopeConfigInterface $scopeConfig
     */
    public function __construct(
        \Magento\Framework\App\Config\ScopeConfigInterface $scopeConfig
    ) {
        $this->_scopeConfig = $scopeConfig;
    }

    /**
     * Realiza validação dos dados do cartão
     *
     * @param $paymentOrder
     * @return bool|string
     * @throws ValidatorException
     */
    public function validateCreditCard($paymentOrder)
    {

       if(!isset($paymentOrder["additional_data"]["cc_card"])) {
           throw new ValidatorException(new Phrase('Card type is empty'));
       }

       if(!isset($paymentOrder["additional_data"]["cc_cardholder"])){
           throw new ValidatorException(new Phrase('Card holder is empty'));
       }

       if(!isset($paymentOrder["additional_data"]["cc_number"])) {
           throw new ValidatorException(new Phrase('Card number is empty'));
       }

       if(!isset($paymentOrder["additional_data"]["cc_exp_month"])){
           throw new ValidatorException(new Phrase('Card expiration month is empty'));
       }

       if(!isset($paymentOrder["additional_data"]["cc_exp_year"])) {
           throw new ValidatorException(new Phrase('Card expiration month is empty'));

       }

       if(!isset($paymentOrder["additional_data"]["cc_security_code"])){
           throw new ValidatorException(new Phrase('Card security code is empty'));

       }

       if($paymentOrder["additional_data"]["cc_card"] === self::JCB_PAYMENT_METHOD &&
           $paymentOrder["additional_data"]["cc_installments"] != 1) {
            throw new ValidatorException(new Phrase('JCB card does not accept parcels'));
       }

       return true;
    }


    /**
     * Busca as bandeiras selecionadas na plataforma do lojista
     *
     * @return mixed
     */
    public function CcType()
    {
        return $this->_scopeConfig->getValue('payment/yapay_credit_card/cctypes');
    }

    /**
     * Realiza tratamento dos cartões buscado no painel do lojista
     *
     * @return array
     */
    protected function getCcAvailableTypes()
    {
        $types = $this->CcType();

        $string_types_quebrada = explode(",", $types);

        $arrayJson =  [];

        foreach ($string_types_quebrada as $key => $value) {
            $arrayJson[] = json_decode($string_types_quebrada[$key]);
        }

        return $arrayJson;
    }

}