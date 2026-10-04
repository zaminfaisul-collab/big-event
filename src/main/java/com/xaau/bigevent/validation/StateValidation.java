package com.xaau.bigevent.validation;

import com.xaau.bigevent.anno.State;

import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

public class StateValidation implements ConstraintValidator<State,String>{

    /**
     * @param value 将来要校验的数据
     * 
     * @return 返回false为校验不通过，返回true为校验成功
     */
    @Override
    public boolean isValid(String value, ConstraintValidatorContext context) {

        //提供校验规则
        if(value == null){
            return false;
        }

        if( "已发布".equals(value) || "草稿".equals(value)){
            return true;
        }

        return false;

    }

}
