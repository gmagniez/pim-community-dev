import {useFeatureFlags, useTranslate, userContext} from '@akeneo-pim-community/shared';
import {Button, Pill, SectionTitle, Table, useBooleanState} from 'akeneo-design-system';
import {useMemo} from 'react';
import styled from 'styled-components';
import {Attribute, CATEGORY_ATTRIBUTE_TYPE_AREA, CATEGORY_ATTRIBUTE_TYPE_RICHTEXT} from '../../../models';
import {getLabelFromAttribute} from '../../attributes';
import {useTemplateForm} from '../../providers/TemplateFormProvider';
import {AddTemplateAttributeModal} from '../AddTemplateAttributeModal';
import {useReorderAttributes} from '../../../hooks/useReorderAttributes';
import {useQueryClient} from 'react-query';

const useAttributeFormHasErrors = () => {
  const [state] = useTemplateForm();

  return (attributeUuid: string) => {
    return Object.values(state.attributes?.[attributeUuid]?.labels || {}).some(({errors}) => errors.length > 0);
  };
};

type Props = {
  attributes: Attribute[];
  selectedAttribute: Attribute;
  templateId: string;
  onAttributeSelection: (attribute: Attribute) => void;
};

export const AttributeList = ({attributes, selectedAttribute, templateId, onAttributeSelection}: Props) => {
  const translate = useTranslate();
  const catalogLocale = userContext.get('catalogLocale');
  const featureFlags = useFeatureFlags();
  const attributeFormHasErrors = useAttributeFormHasErrors();
  const mutation = useReorderAttributes();
  const queryClient = useQueryClient();

  const [isAddTemplateAttributeModalOpen, openAddTemplateAttributeModal, closeAddTemplateAttributeModal] =
    useBooleanState(false);

  const handleRowOnclick = (attribute: Attribute) => {
    onAttributeSelection(attribute);
  };

  const handleReorder = (indices: number[]) => {
    if (mutation.isLoading){
      return;
    }
    const uuids = indices.map(i => attributes[i]?.uuid);
    mutation.mutate(
      {templateUuid: templateId, uuids: uuids},
      {onSettled: () => queryClient.invalidateQueries(['get-template', templateId])}
    );
  };

  const sortedAttributes = useMemo(
    () =>
      attributes.sort((attribute1: Attribute, attribute2: Attribute): number => {
        if (attribute1.order >= attribute2.order) {
          return 1;
        } else if (attribute1.order < attribute2.order) {
          return -1;
        }
        return 0;
      }),
    [attributes]
  );

  return (
    <AttributeListContainer>
      <SectionTitle sticky={0}>
        <SectionTitle.Title>{translate('akeneo.category.attributes')}</SectionTitle.Title>
        {featureFlags.isEnabled('category_template_customization') && (
          <AddAttributeButton ghost size="small" level="tertiary" onClick={openAddTemplateAttributeModal}>
            {translate('akeneo.category.template.add_attribute.add_button')}
          </AddAttributeButton>
        )}
      </SectionTitle>
      <ScrollablePanel>
        <Table isDragAndDroppable={true} onReorder={handleReorder}>
          <Table.Header sticky={0}>
            <Table.HeaderCell>{translate('akeneo.category.template_list.columns.header')}</Table.HeaderCell>
            <Table.HeaderCell>{translate('akeneo.category.template_list.columns.code')}</Table.HeaderCell>
            <Table.HeaderCell>{translate('akeneo.category.template_list.columns.type')}</Table.HeaderCell>
            <ErrorPillTableHeaderCell />
          </Table.Header>
          <Table.Body>
            {sortedAttributes.map((attribute: Attribute) => (
              <Table.Row
                key={attribute.uuid}
                onClick={() => {
                  handleRowOnclick(attribute);
                }}
                isSelected={attribute === selectedAttribute}
              >
                <Table.Cell rowTitle>{getLabelFromAttribute(attribute, catalogLocale)}</Table.Cell>
                <Table.Cell>{attribute.code}</Table.Cell>
                <Table.Cell>
                  {translate(
                    `akeneo.category.template.attribute.type.${
                      attribute.type !== CATEGORY_ATTRIBUTE_TYPE_RICHTEXT
                        ? attribute.type
                        : CATEGORY_ATTRIBUTE_TYPE_AREA
                    }`
                  )}
                </Table.Cell>
                <ErrorPillTableCell>
                  {attributeFormHasErrors(attribute.uuid) && <Pill level={'danger'} />}
                </ErrorPillTableCell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table>
      </ScrollablePanel>
      {isAddTemplateAttributeModalOpen && (
        <AddTemplateAttributeModal templateId={templateId} onClose={closeAddTemplateAttributeModal} />
      )}
    </AttributeListContainer>
  );
};

const AttributeListContainer = styled.div`
  width: 100%;
`;

const AddAttributeButton = styled(Button)`
  margin-left: auto;
`;

const ScrollablePanel = styled.div`
  overflow-y: scroll;
  height: calc(100% - 44px);
`;

const ErrorPillTableCell = styled(Table.Cell)`
  display: flex;
  justify-content: flex-end;
  width: 75px;
`;

const ErrorPillTableHeaderCell = styled(Table.HeaderCell)`
  width: 75px;
`;
