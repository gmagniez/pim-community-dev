import React, {useState} from 'react';
import styled from 'styled-components';
import {Attribute} from '../../models';
import {AttributeList} from './AttributeList';
import {AttributeSettings} from './AttributeSettings';
import {LabelCollection, useFeatureFlags, useTranslate} from '@akeneo-pim-community/shared';
import {NoTemplateAttribute} from './NoTemplateAttribute';
import {useCatalogActivatedLocales} from '../../hooks/useCatalogActivatedLocales';

interface Props {
  attributes: Attribute[];
  templateId: string;
}

type Translations = {[attributeUuid: string]: LabelCollection};

type AttributeTranslationErrors = {[attributeUuid: string]: {[locale: string]: string[]}};

export const EditTemplateAttributesForm = ({attributes, templateId}: Props) => {
  const featureFlag = useFeatureFlags();
  const translate = useTranslate();
  const [selectedAttributeUuid, setSelectedAttributeUuid] = useState<string | null>(null);
  const locales = useCatalogActivatedLocales();
  const handleAttributeSelection = (attribute: Attribute) => {
    setSelectedAttributeUuid(attribute.uuid);
  };
  const getSelectedAttribute = () => {
    return attributes.find(attribute => attribute.uuid === selectedAttributeUuid) ?? attributes[0];
  };

  const [translations, setTranslations] = useState<Translations>({});
  const [translationErrorList, setTranslationErrorList] = useState<AttributeTranslationErrors>({});
  console.log(translationErrorList);

  const handleTranslationsChange = (locale: string, value: string) => {
    setTranslations({
      ...translations,
      [getSelectedAttribute().uuid]: {...translations[getSelectedAttribute().uuid], [locale]: value},
    });
  };

  const handleTranslationErrorsChange = (locale: string, errors: string[]) => {
    // handle differently setTranslationErrorList in .catch and in .then (in .catch we do not take into account the previous errors)
    setTranslationErrorList(previousTranslationErrors => {
      const attributeUuid = getSelectedAttribute().uuid;
      const attributeErrors = previousTranslationErrors[attributeUuid] || {}; // Ensure the attribute's error object exists
      const localeErrors = attributeErrors[locale] || []; // Ensure the locale's error array exists
      const updatedLocaleErrors = [...localeErrors, ...errors];
      const updatedAttributeErrors = {...attributeErrors, [locale]: updatedLocaleErrors};
      if (updatedAttributeErrors[locale].length === 0) {
        delete updatedAttributeErrors[locale];
      }
      // console.log(errors);
      // console.log(attributeUuid);
      // console.log(attributeErrors);
      // console.log(localeErrors);
      // console.log(updatedLocaleErrors);
      // console.log(updatedAttributeErrors);

      return {...previousTranslationErrors, [attributeUuid]: updatedAttributeErrors};
    });
  };
  // {
  //   'attribute_uuid' : {
  //   'en_US': [
  //     'error message 1',
  //     'error message 2',
  //   ],
  //     'fr_FR': [
  //     'error message 3'
  //   ]
  // }
  // }

  if (attributes.length === 0) {
    return (
      <NoTemplateAttribute
        templateId={templateId}
        title={translate('akeneo.category.template.add_attribute.no_attribute_title')}
        instructions={translate('akeneo.category.template.add_attribute.no_attribute_instructions')}
        createButton={true}
      />
    );
  }
  // console.log('parent')
  // console.log(translationErrorList)
  return (
    <FormContainer>
      <Attributes>
        <AttributeList
          attributes={attributes}
          selectedAttribute={getSelectedAttribute()}
          templateId={templateId}
          onAttributeSelection={handleAttributeSelection}
        />
        {featureFlag.isEnabled('category_template_customization') && locales && (
          <AttributeSettings
            key={getSelectedAttribute().uuid}
            attribute={getSelectedAttribute()}
            activatedCatalogLocales={locales}
            translationsFormData={translations[getSelectedAttribute().uuid]}
            onTranslationsChange={handleTranslationsChange}
            translationErrors={translationErrorList[getSelectedAttribute().uuid]}
            onTranslationErrorsChange={handleTranslationErrorsChange}
          />
        )}
      </Attributes>
    </FormContainer>
  );
};

const FormContainer = styled.div`
  height: calc(100%);
  & > * {
    margin: 0 10px 20px 0;
  }
`;

const Attributes = styled.div`
  display: flex;
  width: 100%;
  height: calc(100% - 40px);
`;
